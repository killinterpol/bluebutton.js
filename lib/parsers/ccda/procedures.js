/*
 * Parser for the CCDA procedures section
 */

Parsers.CCDA.procedures = function (ccda) {
  
  var parseDate = Documents.parseDate;
  var parseName = Documents.parseName;
  var parseAddress = Documents.parseAddress;
  var data = [], el;
  var low = "";
  var high = "";
  
  var procedures = ccda.section('procedures');
  
  procedures.entries().each(function(entry) {
    
    el = entry.tag('effectiveTime');
    var date = parseDate(el.attr('value'));
    if (date === null) {
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
                date = low;
            } else if (low !== null && low.toString() === high.toString()) {
                date = low;
            } else if (low !== null && high !== null) {
                date = { "start": low, "end": high };
            } else if (low === null && high !== null) {
                date = high;
            } else {
                date = null;
            }
        }catch (ex) {
            console.error(ex);
            //ignore - date remains null
            date = null;
            low = null;
            high = null;
        }
    }
    
    el = entry.tag('code');
    var name = el.attr('displayName'),
        code = el.attr('code'),
        code_system = el.attr('codeSystem');

    if (!name) {
      name = Core.stripWhitespace(entry.tag('originalText').val());
    }
    
    // 'specimen' tag not always present
    // el = entry.tag('specimen').tag('code');
    // var specimen_name = el.attr('displayName'),
    //     specimen_code = el.attr('code'),
    //     specimen_code_system = el.attr('codeSystem');
    var specimen_name = null,
        specimen_code = null,
        specimen_code_system = null;
    
    el = entry.tag('performer').tag('addr');
    var organization = el.tag('name').val(),
        phone = el.tag('telecom').attr('value');
    
    var performer_dict = parseAddress(el);
    performer_dict.organization = organization;
    performer_dict.phone = phone;
    
    // participant => device
    el = entry.template('2.16.840.1.113883.10.20.22.4.37').tag('code');
    var device_name = el.attr('displayName'),
        device_code = el.attr('code'),
        device_code_system = el.attr('codeSystem');
    
    var tempObj = {
      name: name,
      code: code,
      code_system: code_system,
      specimen: {
        name: specimen_name,
        code: specimen_code,
        code_system: specimen_code_system
      },
      performer: performer_dict,
      device: {
        name: device_name,
        code: device_code,
        code_system: device_code_system
      }
    }
    tempObj["date" + (date !== null && (typeof(date.start) !== 'undefined') ? "_range" : "")] = date;
    data.push(tempObj);
  });
  
  return data;
};
