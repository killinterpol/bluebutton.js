/*
 * Parser for the CCDA allergies section
 */

Parsers.CCDA.payers = function (ccda) {
  
  var parseDate = Documents.parseDate;
  var parseName = Documents.parseName;
  var parseAddress = Documents.parseAddress;
  var data = [], el;
  
  var payers = ccda.section('payers');
  
  payers.entries().each(function(entry) {
    
    el = entry.tag('effectiveTime');
    var start_date = parseDate(el.tag('low').attr('value')),
        end_date = parseDate(el.tag('high').attr('value'));
    
    el = entry.template('2.16.840.1.113883.10.20.22.4.7').tag('code');
    var name = el.attr('displayName'),
        code = el.attr('code'),
        code_system = el.attr('codeSystem'),
        code_system_name = el.attr('codeSystemName');
    
    el = entry.template('2.16.840.1.113883.10.20.22.4.28').tag('value');
    var status = el.attr('displayName');
    
    data.push({
      date_range: {
        start: start_date,
        end: end_date
      },
      name: name,
      code: code,
      code_system: code_system,
      code_system_name: code_system_name,
    });
  });
  
  return data;
};
