var cbfunc
var xhr = new XMLHttpRequest();
xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200)  {
        cbfunc(JSON.parse(xhr.responseText));
    }
};




sendRequest = function(callback,columns,table_id,sql_query) {
    cbfunc = callback
    console.log('sent')
    url = `http://data.gov.au/api/action/datastore_search_sql?sql=SELECT%20${ columns }%20from%20%22${ table_id }%22%20${ encodeURI(sql_query) }`
    xhr.open("GET", url);
    xhr.send();
}




console.log('data_gov_request.js loaded')