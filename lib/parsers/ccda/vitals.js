/*
 * Parser for the CCDA vitals section
 */

Parsers.CCDA.vitals = function (ccda) {
  
  var parseDate = Documents.parseDate;
  var parseName = Documents.parseName;
  var parseAddress = Documents.parseAddress;
  var data = [], el;
  
  var vitals = ccda.section('vitals');
  
  vitals.entries().each(function(entry) {
    
    el = entry.tag('effectiveTime');
    var entry_date = parseDate(el.attr('value'));
    var low = "";
    var high = "";
    if (entry_date === null) {
        try {
            low = parseDate(entry.tag('component').tag('effectiveTime').tag('low').attr('value'));
            high = parseDate(entry.tag('component').tag('effectiveTime').tag('high').attr('value'));

            if (low > high) throw "Invalid date range";

            if (low !== null && low.toString() === high.toString()) {
                entry_date = low;
            } else if (low !== null && high !== null) {
                entry_date = { "start": low, "end": high };
            } else if (low === null && high !== null) {
                entry_date = high;
            } else if (low !== null && high === null) {
                entry_date = low;
            } else {
                entry_date = null;
            }
        }catch (ex) {
            //ignore - date remains null
            entry_date = null;
            low = null;
            high = null;
        }
    }
    
    var result;
    var results = entry.elsByTag('component');
    var results_data = [];
    
    for (var i = 0; i < results.length; i++) {
      result = results[i];
      
      el = result.tag('code');
      var name = el.attr('displayName'),
          code = el.attr('code'),
          code_system = el.attr('codeSystem'),
          code_system_name = el.attr('codeSystemName');
      
      el = result.tag('value');
      var value = parseFloat(el.attr('value')),
          unit = el.attr('unit');
      
      results_data.push({
        name: name,
        code: code,
        code_system: code_system,
        code_system_name: code_system_name,
        value: value,
        unit: unit
      });
    }
    
    var tempObj = {
      results: results_data
    };
    tempObj["date" + (entry_date !== null && (typeof(entry_date.start) !== 'undefined') ? "_range" : "")] = entry_date;
    data.push(tempObj);

  });
  
  return data;
};
