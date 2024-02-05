import { BadgeParams, BadgeType } from './models';

type CommandLine = Record<'cmd' | 'type' | 'firstname' | 'lastname' | 'barcode' | 'meal', string>;

export function parseBadges(csv: string[][], columns: Record<'cmd' | 'type' | 'firstname' | 'lastname' | 'barcode' | 'meal', number>): BadgeParams[] {
     const commands = csv.reduce(
      (a: Map<string, CommandLine[]>, b: string[]) => {
        const current = a.get(b[columns.cmd]) ?? [];
        current.push({
            cmd: b[columns.cmd],
            type: b[columns.type],
            firstname: b[columns.firstname],
            lastname:b[columns.lastname],
            barcode: b[columns.barcode],
            meal: b[columns.meal],
        });
        a.set(b[columns.cmd], current);
        return a;
      },
      new Map<string, CommandLine[]>()
    );

    return Array.from(commands.values()).flatMap((cmd) => commandsBadges(cmd));
}

function commandsBadges(command: CommandLine[]): BadgeParams[] {
    return command
        .filter((line) => MAPPING.has(line.type))
        .map((line) => ({
            ...line,
            type: MAPPING.get(line.type),
            univ1: foundUniv('Uam', command, line),
            univ2: foundUniv('Upm', command, line),
            meal: MAPPING_MEAL.get(line.meal) ?? 'meat',
        } satisfies BadgeParams));
}

function foundUniv(ampm: 'Uam' | 'Upm', lines: CommandLine[], command: CommandLine): string | undefined {
    if (command.type !== 'Université et Conférence') {
        return undefined;
    }
    let found: string | undefined = undefined;
    for (const line of lines) {
        if (line.type.startsWith(ampm)) {
            found = line.type.substring(7);
        }
    }
    return found;
}

const MAPPING = new Map<string, BadgeType>([
    ['Staff', 'staff'],
    ['Sponsor, Accès Expo', 'sponsor'],
    ['Speakers', 'speaker'],
    ['Conférence', 'attendee'],
    ['Université et Conférence', 'attendee'],
    ['Sponsor,  Accès Conférence', 'attendee'],
]);

const MAPPING_MEAL = new Map<string, BadgeParams['meal']>([
    ['Normal', 'meat'],
    ['Végétarien', 'vege'],
]);
