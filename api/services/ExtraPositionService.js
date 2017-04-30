var Promise = require("bluebird");

const SALARY_BASE = 7210;
const SALARY_PRESIDENT = 7267;
const SALARY_QUESTERS = 5004;
const SALARY_VICE_PRESIDENT = 1038;
const SALARY_COMMISSION_PRESIDENT = 880;
const SALARY_GENERAL_REPORTER = 880;
const SALARY_SCIENTIFIC_CHOICE_PRESIDENT = 880;
const SALARY_SECRETARY = 692;

const PARLIAMENT_OFFICE_REGEX = /Assemblée\snationale/;

const PRESIDENT_REGEX = /Président.{0,1}$/;
const VICE_PRESIDENT_REGEX = /Vice-président./;

const QUESTERS_REGEX = /Questeur./;
const COMMISSION_REGEX = /Commission.*/;
const FINANCIAL_COMMISSION_REGEX = /Commission.*des\sfinances/;
const GENERAL_REPORTER_REGEX = /Rapporteur.{0,1}\sgénérale/;
const SECRETARY_REGEX = /Secrétaire.$/;
const SALARY_SCIENTIFIC_CHOICE_REGEX = /Office\sparlementaire\sd.évaluation\sdes\schoix\sscientifiques\set\stechnologiques/;

const EXTRA_POSITIONS = [
  { "position": VICE_PRESIDENT_REGEX, "office": PARLIAMENT_OFFICE_REGEX, "salary": SALARY_VICE_PRESIDENT },
  { "position": PRESIDENT_REGEX, "office": PARLIAMENT_OFFICE_REGEX, "salary": SALARY_PRESIDENT },
  { "position": PRESIDENT_REGEX, "office": COMMISSION_REGEX, "salary": SALARY_COMMISSION_PRESIDENT },
  { "position": QUESTERS_REGEX, "office": PARLIAMENT_OFFICE_REGEX, "salary": SALARY_QUESTERS },
  { "position": GENERAL_REPORTER_REGEX, "office": FINANCIAL_COMMISSION_REGEX, "salary": SALARY_GENERAL_REPORTER },
  { "position": SECRETARY_REGEX, "office": PARLIAMENT_OFFICE_REGEX, "salary": SALARY_SECRETARY },
  { "position": PRESIDENT_REGEX, "office": SALARY_SCIENTIFIC_CHOICE_REGEX, "salary": SALARY_SCIENTIFIC_CHOICE_PRESIDENT },
]

var self = module.exports = {
  findExtraPositionsForDeputy: function(deputyId) {
    return ExtraPosition.find()
    .where({ deputyId: deputyId })
    .then(function(extraPositions) {
      return extraPositions;
    })
  },

  getSalaryForDeputy: function(deputyId) {
    return self.findExtraPositionsForDeputy(deputyId)
    .then(function(extraPositions) {
      var salary = SALARY_BASE;
      if (extraPositions) {
        for (i in extraPositions) {
          salary += matchPosition(extraPositions[i]);
        }
      }
      return salary;
    })
  }
}

var matchPosition = function(deputyPosition) {
  var salary = 0;
  for (j in EXTRA_POSITIONS) {
    if (deputyPosition.position.match(EXTRA_POSITIONS[j].position) && deputyPosition.office.match(EXTRA_POSITIONS[j].office)) {
      salary = EXTRA_POSITIONS[j].salary;
      break;
    }
  }
  return salary
}
