/*
 * Parser for the CCDA demographics section
 */

Parsers.CCDA.demographics = function (ccda) {
  var util = require('util');
  var parseDate = Documents.parseDate;
  var parseName = Documents.parseName;
  var parseAddress = Documents.parseAddress;
  var parseIds = Documents.parseIds;
  var parseTelco = Documents.parseTelco;
  var data = {}, el;
  
  var demographics = ccda.section('demographics');

  
  var patient = demographics.tag('patientRole');

  el = patient.immediateChildTags('id');
  var ids = parseIds(el);

  el = patient.tag('patient').tag('name');
  var patient_name_dict = parseName(el);

  el = patient.tag('patient');
  var dob = parseDate(el.tag('birthTime').attr('value')),
      gender = Core.Codes.gender(el.tag('administrativeGenderCode').attr('code')),
      marital_status = Core.Codes.maritalStatus(el.tag('maritalStatusCode').attr('code'));
  
  el = patient.tag('addr');
  var patient_address_dict = parseAddress(el);
  
  var telcoObjs = parseTelco(patient.immediateChildTags('telecom'));
  
  var language = patient.tag('languageCommunication').tag('languageCode').attr('code'),
      race = patient.tag('raceCode').attr('displayName'),
      ethnicity = patient.tag('ethnicGroupCode').attr('displayName'),
      religion = patient.tag('religiousAffiliationCode').attr('displayName');
  
  el = patient.tag('birthplace');
  var birthplace_dict = parseAddress(el);
  
  el = patient.tag('guardian');
  var guardian_relationship = el.tag('code').attr('displayName'),
      guardian_relationship_code = el.tag('code').attr('code');

  var guardianObjs = parseTelco(el.immediateChildTags('telecom'));
  
  el = el.tag('guardianPerson').tag('name');
  var guardian_name_dict = parseName(el);
  
  el = patient.tag('guardian').tag('addr');
  var guardian_address_dict = parseAddress(el);
  
  el = patient.tag('providerOrganization');
  var provider_organization = el.tag('name').val();
  var providerObjs = parseTelco(el.immediateChildTags('telecom'));
  
  var provider_address_dict = parseAddress(el.tag('addr'));
  
  data = {
    id: ids !== null ? ids : '',
    name: patient_name_dict,
    dob: dob,
    gender: gender,
    marital_status: marital_status,
    address: patient_address_dict,
    //phone: phone,
    //email: email,
    
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
      //phone: guardian_phone,
      //email: guardian_email
    },
    provider: {
      organization: provider_organization,
      address: provider_address_dict,
      //phone: provider_phone,
      //email: provider_email
    }
  };

  for (var i in telcoObjs) {
    data[i] = telcoObjs[i];
  }

  for (var i in guardianObjs) {
    data.guardian[i] = guardianObjs[i];
  }

  for (var i in providerObjs) {
    data.provider[i] = providerObjs[i];
  }

    
  return data;
};
