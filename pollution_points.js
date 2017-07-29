result_handler = function(data) {
    points = gps_year_to_points(data['result']['records'])
    width = window.innerWidth
    height = window.innerHeight
    setInterval(animate_points, 50, points, width, height, 4)
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


sql_query = 'WHERE latitude >-17 AND latitude <-16 AND longitude >145.2 AND longitude <145.4'
                                    // Put your SQL query here.


sendRequest(function_name, columns, table_id, sql_query)


gps_year_to_points = function(items) {
    points = []
    rows = { 'longitude': [], 'latitude': [], 'report_year': [] }
    columns = ['longitude', 'latitude', 'report_year']
    for (i = 0; i < items.length; i++) {
        items[i]['report_year'] = parseInt(
            items[i]['report_year'].substring(0,4)
        )
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
    for (i = 0; i < columns.length; i++) {
        mins[columns[i]] = Math.min(...rows[columns[i]])
                           - borders[columns[i]]
        maxs[columns[i]] = Math.max(...rows[columns[i]])
                           + borders[columns[i]]
    }
    for (i = 0; i < items.length; i++) {
        coord = {}
        for (j = 0; j < columns.length; j++) {
            dist = items[i][columns[j]] - mins[columns[j]]
            total_range = maxs[columns[j]] - mins[columns[j]]
            coord[point_vars[j]] = 100 * dist / total_range
        }
        points.push(coord)
    }
    return points
}