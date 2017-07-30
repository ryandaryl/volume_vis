result_handler = function(data) {
    points = gps_year_to_points(data['result']['records'])
    width = window.innerWidth
    height = window.innerHeight
    timer = setInterval(animate_points, 100, points, width, height, 4)
}                                    // Change this function to do whatever you want with the results of the query.


function_name = result_handler      // Change this to the of the         
                                    // function to be called.
                                    // Don't use quotes.


columns = ''
column_names = [
   'air_total_emission_kg',
   'facility_name',
   'latitude',
   'longitude',
   'primary_anzsic_class_name',
   'report_year',
   'substance_name'
]
for (i = 0; i < column_names.length; i++) {
    comma = (i == column_names.length - 1 ?
            '' : ', ')
    columns += column_names[i] + comma
}


table_id = '9ec26edf-ea5b-4869-8c2c-38b41fb3a51d'
                                    // Change this to the id of the table you want to query. You can get it by clicking "Explore" for a .csv file at data.gov.au, then clicking the green "Data-API" button.

var bound_box_long_lat
var duration
var timer
startPollutionAnimation = function(arg1, arg2) {
    document.getElementById("map").setAttribute("style", "z-index: -1")
    bound_box_long_lat = arg1
    duration = arg2

    lat_min = bound_box_long_lat[1]['latitude'].toFixed(3)
    lat_max = bound_box_long_lat[0]['latitude'].toFixed(3)
    lon_min = bound_box_long_lat[0]['longitude'].toFixed(3)
    lon_max = bound_box_long_lat[1]['longitude'].toFixed(3)

/*
    lat_min = -38.393
    lat_max = -38.076
    lon_min = 145.599
    lon_max = 146.737
*/

    console.log(lat_min, lat_max, lon_min, lon_max)

    sql_query = `WHERE latitude >${ lat_min } AND latitude <${ lat_max } AND longitude >${ lon_min } AND longitude <${ lon_max } ORDER BY air_total_emission_kg LIMIT 30000`
    console.log(sql_query)
    sendRequest(function_name, columns, table_id, sql_query)
}

stopPollutionAnimation = function() {
    clearInterval(timer)
    document.getElementById("map").setAttribute("style", "z-index: 0; pointer-events: auto;")
}
window.onmousedown= stopPollutionAnimation;

gps_year_to_points = function(items) {
    points = []
    rows = { 'longitude': [], 'latitude': [], 'report_year': [] }
    columns = ['longitude', 'latitude', 'report_year']
    for (i = 0; i < items.length; i++) {
        items[i]['report_year'] = parseInt(
            items[i]['report_year'].substring(0,4)
        )
                         // round report year down to first year
                         // eg. financial year 2006/2007 -> 2006
        items[i]['latitude'] = Math.abs(items[i]['latitude'])
                         // convert latitude to absolute values
        for (j = 0; j < columns.length; j++) {
            rows[columns[j]].push(items[i][columns[j]])
        }
    }
    mins = {}
    maxs = {}
    borders = { 'longitude': 0.1,
                'latitude': 0.1,
                'report_year': 1 }
    point_vars = ['x', 'y', 't']
    points_dict = {}
    for (i = 0; i < columns.length; i++) {
        mins['report_year'] = Math.min(...rows['report_year'])
                           - borders['report_year']
        maxs['report_year'] = Math.max(...rows['report_year'])
                           + borders['report_year']
    }
    mins['longitude'] = bound_box_long_lat[0]['longitude']
    mins['latitude'] = Math.abs(bound_box_long_lat[0]['latitude'])
    maxs['longitude'] = bound_box_long_lat[1]['longitude']
    maxs['latitude'] = Math.abs(bound_box_long_lat[1]['latitude'])
    console.log(mins, maxs)
    for (i = 0; i < items.length; i++) {
        coord = {}
        coord_string = ''
        for (j = 0; j < columns.length; j++) {
            dist = items[i][columns[j]] - mins[columns[j]]
            total_range = maxs[columns[j]] - mins[columns[j]]
            coord[point_vars[j]] = 100 * dist / total_range
            coord_string += coord[point_vars[j]].toString()
        }
        details = [
            'air_total_emission_kg',
           'facility_name',
           'primary_anzsic_class_name'
        ]
        for (j = 0; j < details.length; j++) {
            coord[details[j]] = items[i][details[j]]
        }
        console.log(coord_string)
        if (!(coord_string in points_dict) && points.length <= 300) {
            points_dict[coord_string] = true
            points.push(coord)
        }
    }
    console.log(points)
    return points
}