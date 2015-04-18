/*
 * Parser for the CCDA demographics section
 */

Parsers.CCDA.demographics = function (ccda) {
  var util = require('util');
  var parseDate = Documents.parseDate;
  var parseName = Documents.parseName;
  var parseAddress = Documents.parseAddress;
  var parseTelecom = Documents.parseTelecom;
  var data = {}, el;
  
  var demographics = ccda.section('demographics');

  
  var patient = demographics.tag('patientRole');

  el = patient.immediateChildTags('id');
  var ids = [];
  var id = {};
  var type = "";
  for (var i in el) {
    type = "other";
    if (el[i].attr('root') === '2.16.840.1.113883.4.1') {
      type = "ssn";
    } else if (el[i].attr('root') === '2.16.840.1.113883.4.825') {
      type = "cgm";
    }
    id = { type: type, 'value': el[i].attr('extension'), 'root': el[i].attr('root') };
    ids.push(id);
  }

  el = patient.tag('patient').tag('name');
  var patient_name_dict = parseName(el);

  el = patient.tag('patient');
  var dob = parseDate(el.tag('birthTime').attr('value')),
      gender = Core.Codes.gender(el.tag('administrativeGenderCode').attr('code')),
      marital_status = Core.Codes.maritalStatus(el.tag('maritalStatusCode').attr('code'));
  
  el = patient.tag('addr');
  var patient_address_dict = parseAddress(el);
  
  var telcoObjs = getTelco(patient.immediateChildTags('telecom'));
  var email = telcoObjs.email;
  var phone = telcoObjs.phone;
  
  var language = patient.tag('languageCommunication').tag('languageCode').attr('code'),
      race = patient.tag('raceCode').attr('displayName'),
      ethnicity = patient.tag('ethnicGroupCode').attr('displayName'),
      religion = patient.tag('religiousAffiliationCode').attr('displayName');
  
  el = patient.tag('birthplace');
  var birthplace_dict = parseAddress(el);
  
  el = patient.tag('guardian');
  var guardian_relationship = el.tag('code').attr('displayName'),
      guardian_relationship_code = el.tag('code').attr('code');

  var guardianObjs = getTelco(el.immediateChildTags('telecom'));
  var guardian_phone = guardianObjs.phone;
  var guardian_email = guardianObjs.email;
  
  el = el.tag('guardianPerson').tag('name');
  var guardian_name_dict = parseName(el);
  
  el = patient.tag('guardian').tag('addr');
  var guardian_address_dict = parseAddress(el);
  
  el = patient.tag('providerOrganization');
  var provider_organization = el.tag('name').val();
  var providerObjs = getTelco(el.immediateChildTags('telecom'));
  var provider_phone = providerObjs.phone;
  var provider_email = providerObjs.email;
  
  var provider_address_dict = parseAddress(el.tag('addr'));
  
  data = {
    id: ids !== null ? ids : '',
    name: patient_name_dict,
    dob: dob,
    gender: gender,
    marital_status: marital_status,
    address: patient_address_dict,
    phone: phone,
    email: email,
    language: language,
    race: race,
    ethnicity: ethnicity,
    religion: religion,
    birthplace: {
      state: birthplace_dict.state,
      zip: birthplace_dict.zip,
      country: birthplace_dict.country
    },
    guardian: {
      name: {
        given: guardian_name_dict.given,
        family: guardian_name_dict.family
      },
      relationship: guardian_relationship,
      relationship_code: guardian_relationship_code,
      address: guardian_address_dict,
      phone: guardian_phone,
      email: guardian_email
    },
    provider: {
      organization: provider_organization,
      address: provider_address_dict,
      phone: provider_phone,
      email: provider_email
    }
  };

  function getTelco(telcoEls) {
      var email = {};
      var phone = {};
      var tmp = {};

      var obj;
      for (var i in telcoEls) {
        if (i < telcoEls.length) {
            tmp = parseTelecom(telcoEls[i]);
            if (tmp.type === "tel") {
                obj = phone;
            } else if (tmp.type === "mailto") {
                obj = email;
            }

            if(util.isArray(tmp.use)) {
                for(var j in tmp.use) {
                    if (j < tmp.length) {
                        obj[tmp.use[j]] = tmp.val;
                    }
                }
            } else if (tmp.use !== null) {
                obj[tmp.use] = tmp.val;
            } else {
                // default to home
                obj['home'] = tmp.val;
            }
        }
      }
      return {
        email: email,
        phone: phone
      };
  };
    
  return data;
};
