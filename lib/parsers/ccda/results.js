/*
 * Parser for the CCDA results (labs) section
 */

Parsers.CCDA.results = function (ccda) {
  
  var parseDate = Documents.parseDate;
  var parseName = Documents.parseName;
  var parseAddress = Documents.parseAddress;
  var data = [], el;
  
  var results = ccda.section('results');
  
  results.entries().each(function(entry) {
    
    // panel
    el = entry.tag('code');
    var panel_name = el.attr('displayName'),
        panel_code = el.attr('code'),
        panel_code_system = el.attr('codeSystem'),
        panel_code_system_name = el.attr('codeSystemName');
    
    var observation;
    var low = "";
    var high = "";
    var tests = entry.elsByTag('component');
    var tests_data = [];
    var entryDate = parseDate(entry.tag('effectiveTime').attr('value'));
      
    for (var i = 0; i < tests.length; i++) {
      observation = tests[i];
      
      var date = parseDate(observation.tag('effectiveTime').attr('value'));
      if (entryDate !== null && date === null) date = entryDate;
      if (date === null) {
        try {
            low = parseDate(observation.tag('effectiveTime').tag('low').attr('value'));
            high = parseDate(observation.tag('effectiveTime').tag('high').attr('value'));

            if (low > high) throw "Invalid date range";

            if (low !== null && low.toString() === high.toString()) {
                date = low;
            } else if (low !== null && high !== null) {
                date = { "start": low, "end": high };
            } else if (low === null && high !== null) {
                date = high;
            } else if (low !== null && high === null) {
                date = low;
            } else {
                date = null;
            }
        }catch (ex) {
            //ignore - date remains null
            date = null;
            low = null;
            high = null;
        }
      }

      el = observation.tag('code');
      var name = el.attr('displayName'),
          code = el.attr('code'),
          code_system = el.attr('codeSystem'),
          code_system_name = el.attr('codeSystemName');
      
      el = observation.tag('value');
      var value = (el.attr('xsi:type')==='ST') ? el.val() : parseFloat(el.attr('value')),
          unit = el.attr('unit');
      
      el = observation.tag('referenceRange');
      var reference_range_text = Core.stripWhitespace(el.tag('observationRange').tag('text').val()),
          reference_range_low_unit = el.tag('observationRange').tag('low').attr('unit'),
          reference_range_low_value = el.tag('observationRange').tag('low').attr('value'),
          reference_range_high_unit = el.tag('observationRange').tag('high').attr('unit'),
          reference_range_high_value = el.tag('observationRange').tag('high').attr('value');
      
      var tempObj = {
        name: name,
        value: value,
        unit: unit,
        code: code,
        code_system: code_system,
        code_system_name: code_system_name,
        reference_range: {
          text: reference_range_text,
          low_unit: reference_range_low_unit,
          low_value: reference_range_low_value,
          high_unit: reference_range_high_unit,
          high_value: reference_range_high_value,
        }
      }
      tempObj["date" + (date !== null && (typeof(date.start) !== 'undefined') ? "_range" : "")] = date;
      tests_data.push(tempObj);
    }
    
    data.push({
      name: panel_name,
      code: panel_code,
      code_system: panel_code_system,
      code_system_name: panel_code_system_name,
      tests: tests_data
    });
  });
  
  return data;
};
