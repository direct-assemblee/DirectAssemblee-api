const SALARY_BASE = 7210;
const SALARY_PRESIDENT = 7267;
const SALARY_QUESTER = 5004;
const SALARY_VICE_PRESIDENT = 1038;
const SALARY_COMMISSION_PRESIDENT = 880;
const SALARY_GENERAL_REPORTER = 880;
const SALARY_SCIENTIFIC_CHOICE_PRESIDENT = 880;
const SALARY_SECRETARY = 692;

const BRUT_NET_RATIO = 0.80194;

const PARLIAMENT_OFFICE_REGEX = /Assemblée\snationale/;

const PRESIDENT_REGEX = /Président.{0,1}$/;
const VICE_PRESIDENT_REGEX = /Vice-président.{0,1}/;

const QUESTERS_REGEX = /Questeur.{0,1}/;
const COMMISSION_REGEX = /Commission.*/;
const FINANCIAL_COMMISSION_REGEX = /Commission.*des\sfinances/;
const GENERAL_REPORTER_REGEX = /Rapporteur.{0,1}\sgénéral.{0,1}/;
const SECRETARY_REGEX = /Secrétaire/;
const SALARY_SCIENTIFIC_CHOICE_REGEX = /Office\sparlementaire\sd.évaluation\sdes\schoix\sscientifiques\set\stechnologiques/;

const EXTRA_POSITIONS = [
    { 'position': VICE_PRESIDENT_REGEX, 'office': PARLIAMENT_OFFICE_REGEX, 'salary': SALARY_VICE_PRESIDENT },
    { 'position': PRESIDENT_REGEX, 'office': PARLIAMENT_OFFICE_REGEX, 'salary': SALARY_PRESIDENT },
    { 'position': PRESIDENT_REGEX, 'office': COMMISSION_REGEX, 'salary': SALARY_COMMISSION_PRESIDENT },
    { 'position': QUESTERS_REGEX, 'office': PARLIAMENT_OFFICE_REGEX, 'salary': SALARY_QUESTER },
    { 'position': GENERAL_REPORTER_REGEX, 'office': FINANCIAL_COMMISSION_REGEX, 'salary': SALARY_GENERAL_REPORTER },
    { 'position': SECRETARY_REGEX, 'office': PARLIAMENT_OFFICE_REGEX, 'salary': SALARY_SECRETARY },
    { 'position': PRESIDENT_REGEX, 'office': SALARY_SCIENTIFIC_CHOICE_REGEX, 'salary': SALARY_SCIENTIFIC_CHOICE_PRESIDENT },
]

let self = module.exports = {
    SALARY_BASE: SALARY_BASE, // test purpose
    SALARY_PRESIDENT: SALARY_PRESIDENT, // test purpose
    SALARY_QUESTER: SALARY_QUESTER, // test purpose
    SALARY_VICE_PRESIDENT: SALARY_VICE_PRESIDENT, // test purpose
    SALARY_COMMISSION_PRESIDENT: SALARY_COMMISSION_PRESIDENT, // test purpose
    SALARY_GENERAL_REPORTER: SALARY_GENERAL_REPORTER, // test purpose
    SALARY_SCIENTIFIC_CHOICE_PRESIDENT: SALARY_SCIENTIFIC_CHOICE_PRESIDENT, // test purpose
    SALARY_SECRETARY: SALARY_SECRETARY, // test purpose

    findExtraPositionsForDeputy: function(deputyId) {
        return ExtraPosition.find()
        .where({ deputyId: deputyId })
    },

    getSalaryForDeputy: function(deputyId) {
        return self.findExtraPositionsForDeputy(deputyId)
        .then(function(extraPositions) {
            let salary = SALARY_BASE;
            if (extraPositions) {
                for (let i in extraPositions) {
                    salary += matchPosition(extraPositions[i]);
                }
            }
            return Math.round(salary * BRUT_NET_RATIO);
        })
    }
}

let matchPosition = function(deputyPosition) {
    var salary = 0;
    for (let j in EXTRA_POSITIONS) {
        if (deputyPosition.position.match(EXTRA_POSITIONS[j].position) && deputyPosition.office.match(EXTRA_POSITIONS[j].office)) {
            salary = EXTRA_POSITIONS[j].salary;
            break;
        }
    }
    return salary
}
