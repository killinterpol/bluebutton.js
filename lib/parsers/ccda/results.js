/*
 * Parser for the CCDA results (labs) section
 */

Parsers.CCDA.results = function (ccda) {
  
  var parseDate = Documents.parseDate;
  var parseName = Documents.parseName;
  var parseAddress = Documents.parseAddress;
  var data = [], el;
  
  var results = ccda.section('results');

  function parseHighLow(dateTag) {
    var high;
    var low;
    var date;
    try {
        low = parseDate(dateTag.tag('low').attr('value'));
        high = parseDate(dateTag.tag('high').attr('value'));

        if (low !== null && high !== null && low > high) throw "Invalid date range";

        if (low !== null && high !== null && (low.toString() === high.toString())) {
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
    }
    return date;
  }
  
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
    var tests_data = [];
    var retVal;
    var tests = entry.elsByTag('observation'); 
    var entryDate = parseDate(entry.tag('effectiveTime').attr('value'));

    if (entryDate === null) {
      entryDate = parseHighLow(entry.tag('effectiveTime'));
    }
      
    for (var i = 0; i < tests.length; i++) {
      observation = tests[i];
      
      var date = parseDate(observation.tag('effectiveTime').attr('value'));
      if (date === null) {
        date = parseHighLow(observation.tag('effectiveTime'));
      }

      if (entryDate !== null && (date === null || observation.tag('effectiveTime').attr('value') === "00000000000000")) {
        date = entryDate;
      }

      el = observation.tag('code');
      var name = el.attr('displayName'),
          code = el.attr('code'),
          code_system = el.attr('codeSystem'),
          code_system_name = el.attr('codeSystemName');

      if (!name) {
        name = Core.stripWhitespace(observation.tag('text').val());
      }
      
      el = observation.tag('translation');
      var translation_name = el.attr('displayName'),
        translation_code = el.attr('code'),
        translation_code_system = el.attr('codeSystem'),
        translation_code_system_name = el.attr('codeSystemName');
    
      el = observation.tag('value');
      var value = (el.attr('xsi:type')==='ST') ? el.val() : parseFloat(el.attr('value')),
          unit = el.attr('unit');
      // We could look for xsi:type="PQ" (physical quantity) but it seems better
      // not to trust that that field has been used correctly...
      if (value && !isNaN(parseFloat(value))) {
        value = parseFloat(value);
      }
      if (!value) {
        value = el.val(); // look for free-text values
      }
      
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
        translation: {
          name: translation_name,
          code: translation_code,
          code_system: translation_code_system,
          code_system_name: translation_code_system_name
        },
        reference_range: {
          text: reference_range_text,
          low_unit: reference_range_low_unit,
          low_value: reference_range_low_value,
          high_unit: reference_range_high_unit,
          high_value: reference_range_high_value,
        }
      }

      tempObj["date" + (date && (date.start) ? "_range" : "")] = date;
      tests_data.push(tempObj);
    }
    
    var labObj = {
      //date: entryDate,
      name: panel_name,
      code: panel_code,
      code_system: panel_code_system,
      code_system_name: panel_code_system_name,
      tests: tests_data
    };
    labObj["date" + (entryDate && (entryDate.start) ? "_range" : "")] = entryDate;
    data.push(labObj);
  });
  
  return data;
};
