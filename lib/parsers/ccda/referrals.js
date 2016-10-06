/*
 * Parser for the CCDA Referrals section
 */

Parsers.CCDA.referrals = function (ccda) {
  
  var parseDate = Documents.parseDate;
  var parseName = Documents.parseName;
  var parseAddress = Documents.parseAddress;
  var parseIds = Documents.parseIds;
  var parseTelco = Documents.parseTelco;
  var data = [], el;
  
  var referrals = ccda.section('referrals');
  
  referrals.entries().each(function(entry) {

    el = entry.tag('effectiveTime');
    var start_date = parseDate(el.tag('low').attr('value')),
        end_date = parseDate(el.tag('high').attr('value'));

    el = entry.immediateChildTags('id');
    var referral_id = parseIds(el);

    el = entry.template('2.16.840.1.113883.10.20.22.4.140').tag('code');
    var name = el.attr('displayName'),
        code = el.attr('code'),
        code_system = el.attr('codeSystem'),
        code_system_name = el.attr('codeSystemName');

    el = entry.tag("statusCode");
    var status = el.attr("code");

    // Author block
    var author = entry.tag('author');

    //el = author.tag('id');
    //var author_npi = el.attr('value');

    el = author.immediateChildTags('id');
    var author_id = parseIds(el);

    el = author.tag('assignedPerson').tag('name');
    var author_name = parseName(el);
    
    el = author.tag('addr');
    var author_address= parseAddress(el);
    
    var authorTelco = parseTelco(author.immediateChildTags('telecom'));


    // Participant block
    var participant = entry.tag('participant');
    
    el = participant.tag('participantRole');
    var participant_role = el.attr('classCode');

    //el = participant.tag('id');
    //var participant_id = el.attr('value');

    el = participant.immediateChildTags('id');
    var participant_id = parseIds(el);

    el = participant.tag('addr');
    var participant_address = parseAddress(el);

    var participantTelco = parseTelco(participant.immediateChildTags('telecom'));

    el = participant.tag('playingEntity');
    var participant_playing_entity = parseName(el);

    data.push({
      "id": referral_id !== null ? referral_id : '',
      "date_range": {
        "start": start_date,
        "end": end_date
      },
      "name": name,
      "code": code,
      "code_system": code_system,
      "code_system_name": code_system_name,
      "status": status,
      "author": {
        "id": author_id !== null ? author_id : '',
        "name": author_name,
        "address": author_address,
      },
      "participant": {
        "role": participant_role,
        "id": participant_id !== null ? participant_id : '',
        "address": participant_address,
        "name": participant_playing_entity
      }
    });
  });

  //append telco objs 
  for (var i in authorTelco) {
    data[0].author[i] = authorTelco[i];
  }

  for (var i in participantTelco) {
    data[0].participant[i] = participantTelco[i];
  }

  return data;
};

