let Promise = require('bluebird');
let RoleService = require('../../services/RoleService.js');
let InstanceTypeService = require('../../services/InstanceTypeService.js');

const BRUT_NET_RATIO = 0.80194;
let netSalary = function(brut) {
    return Math.round(brut * BRUT_NET_RATIO)
}

const SALARY_BASE = netSalary(7210);
const SALARY_PRESIDENT = netSalary(7267);
const SALARY_VICE_PRESIDENT = netSalary(1038);
const SALARY_QUESTER = netSalary(5004);
const SALARY_SECRETARY = netSalary(692);
const SALARY_EXTRA_ROLE = netSalary(880);

const PRESIDENT_REGEX = /Président.{0,1}$/;
const VICE_PRESIDENT_REGEX = /Vice-Président.{0,1}/;
const QUESTERS_REGEX = /Questeur.{0,1}/;
const GENERAL_REPORTER_REGEX = /Rapporteur.{0,1}\sgénéral.{0,1}/;
const SECRETARY_REGEX = /Secrétaire/;

const ACCOUNTS_PURIFICATION = 'Commission spéciale chargée de vérifier et d\'apurer les comptes';
const SCIENTIFIC_CHOICE_EVALUATION = 'Office parlementaire d\'évaluation des choix scientifiques et technologiques';

const BUREAU_EXTRA_ROLES = [
    { 'position': VICE_PRESIDENT_REGEX, 'salary': SALARY_VICE_PRESIDENT },
    { 'position': PRESIDENT_REGEX, 'salary': SALARY_PRESIDENT },
    { 'position': QUESTERS_REGEX, 'salary': SALARY_QUESTER },
    { 'position': SECRETARY_REGEX, 'salary': SALARY_SECRETARY }
]

const PERMANENT_COMMISSION_EXTRA_ROLES = [
    { 'position': PRESIDENT_REGEX, 'salary': SALARY_EXTRA_ROLE },
    { 'position': GENERAL_REPORTER_REGEX, 'salary': SALARY_EXTRA_ROLE }
]

const NON_PERMANENT_COMMISSION_EXTRA_ROLES = [
    { 'position': PRESIDENT_REGEX, 'specificInstance': ACCOUNTS_PURIFICATION, 'salary': SALARY_EXTRA_ROLE }
]

const OFFICES_EXTRA_ROLES = [
    { 'position': PRESIDENT_REGEX, 'specificInstance': SCIENTIFIC_CHOICE_EVALUATION, 'salary': SALARY_EXTRA_ROLE }
]

let self = module.exports = {
    calculateSalary: function(deputyInstancesAndRoles) {
        let salary = SALARY_BASE;
        for (let i in deputyInstancesAndRoles) {
            salary += matchPosition(deputyInstancesAndRoles[i]);
        }
        return salary;
    }
}

let matchPosition = function(instanceAndRole) {
    var salary = 0;
    if (instanceAndRole.instanceType === InstanceType.BUREAU) {
        salary += findSalaryForPositions(instanceAndRole.positions, BUREAU_EXTRA_ROLES)
    } else if (instanceAndRole.instanceType === InstanceType.PERMANENT_COMMISSION) {
        salary += findSalaryForPositions(instanceAndRole.positions, PERMANENT_COMMISSION_EXTRA_ROLES)
    } else if (instanceAndRole.instanceType === InstanceType.NON_PERMANENT_COMMISSION) {
        salary += findSalaryForPositions(instanceAndRole.positions, NON_PERMANENT_COMMISSION_EXTRA_ROLES)
    } else if (instanceAndRole.instanceType === InstanceType.OFFICE_AND_DELEGATION) {
        salary += findSalaryForPositions(instanceAndRole.positions, OFFICES_EXTRA_ROLES)
    }
    return salary
}

let findSalaryForPositions = function(positions, references) {
    var salary = 0
    for (let i in positions) {
        let position = positions[i]
        for (let j in references) {
            if (position.name.match(references[j].position)
                    && ((references[j].specificInstance == null) || (position.instances.includes(references[j].specificInstance)))) {
                salary += references[j].salary;
                break;
            }
        }
    }
    return salary
}
