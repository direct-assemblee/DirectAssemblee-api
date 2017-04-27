var Promise = require("bluebird");

const SALARY_BASE = 7209.74;
const SALARY_PRESIDENT = 7267.43;
const SALARY_QUESTERS = 5003.57;
const SALARY_VICE_PRESIDENT = 1038.20;
const SALARY_SPECIFIC_COMMISSION_OR_OFFICE = 879.59;
const SALARY_SECRETARY = 692.14;

const EXTRA_POSITIONS = [
  { "name": "A", "salary": SALARY_PRESIDENT },
  { "name": "B", "salary": SALARY_QUESTERS },
  { "name": "Vice-président de l'Assemblée nationale", "salary": SALARY_VICE_PRESIDENT },
  { "name": "C", "salary": SALARY_SPECIFIC_COMMISSION_OR_OFFICE },
  { "name": "Secrétaire de l'Assemblée nationale", "salary": SALARY_SECRETARY },
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
          for (j in EXTRA_POSITIONS) {
            if (extraPositions[i].name.startsWith(EXTRA_POSITIONS[j].name)) {
              salary += EXTRA_POSITIONS[j].salary;
            }
          }
        }
      }
      return salary;
    })
  }
}
