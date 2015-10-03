/*
 * Parser for the CCDA smoking status in social history section
 */

Parsers.CCDA.smoking_status = function (ccda) {
  
  var parseDate = Documents.parseDate;
  var parseName = Documents.parseName;
  var parseAddress = Documents.parseAddress;
  var data, el;

  var social_history = ccda.section('social_history');

  // We can parse all of the social_history sections,
  // but in practice, this section seems to be used for
  // smoking status, so we're just going to break that out.
  var entry = social_history.template('2.16.840.1.113883.10.20.22.4.78');
  if (entry.isEmpty()) {
    entry = social_history.template('2.16.840.1.113883.10.22.4.78');
  }

  el = entry.tag('effectiveTime');
  var entry_date = parseDate(el.attr('value'));
  if (entry_date === null) {
    try {
        low = null;
        high = null;
        if (typeof(entry.tag('effectiveTime').tag('low')) !== "undefined") {
            low = parseDate(entry.tag('effectiveTime').tag('low').attr('value'));
        }
        if (typeof(entry.tag('effectiveTime').tag('high')) !== "undefined") {
            high = parseDate(entry.tag('effectiveTime').tag('high').attr('value'));
        }

        if (low != null && high != null && low > high) throw "Invalid date range";

        if (low !== null && high === null) {
            entry_date = low;
        } else if (low !== null && low.toString() === high.toString()) {
            entry_date = low;
        } else if (low !== null && high !== null) {
            entry_date = { "start": low, "end": high };
        } else if (low === null && high !== null) {
            entry_date = high;
        } else {
            entry_date = null;
        }
    }catch (ex) {
        console.error(ex);
        //ignore - date remains null
        entry_date = null;
        low = null;
        high = null;
    }
  }

  el = entry.tag('value');
  var name = el.attr('displayName'),
      code = el.attr('code'),
      code_system = el.attr('codeSystem'),
      code_system_name = el.attr('codeSystemName');

  data = {
    name: name,
    code: code,
    code_system: code_system,
    code_system_name: code_system_name
  };

  data["date" + (entry_date !== null && (typeof(entry_date.start) !== 'undefined') ? "_range" : "")] = entry_date;
  return data;
};
