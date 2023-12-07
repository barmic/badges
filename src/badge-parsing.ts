import { BadgeParams, BadgeType } from './models';

type CommandLine = Record<'cmd' | 'type' | 'firstname' | 'lastname' | 'barcode', number>;

export function parseBadges(csv: string[][], columns: Record<'cmd' | 'type' | 'firstname' | 'lastname' | 'barcode', number>): BadgeParams[] {
    const commands: Map<string, BadgeParams> = csv.reduce(
      (a: Map<string, BadgeParams>, b: string[]) => {
        const cmd = b[columns.cmd]
        const tarif = b[columns.type];
        const univ1 = tarif.startsWith('Uam') ? tarif.substring(7) : undefined;
        const univ2 = tarif.startsWith('Upm') ? tarif.substring(7) : undefined;
        const type = typeMapping(tarif);
        const current = a.get(cmd);
        if (current) {
          if (univ1) {
            current.univ1 = univ1;
          } else if (univ2) {
            current.univ2 = univ2;
          } else {
            current.type = type;
          }
        } else {
          a.set(cmd, {
            firstname: b[columns.firstname],
            lastname: b[columns.lastname],
            type: type,
            barcode: b[columns.barcode],
            univ1: univ1,
            univ2: univ2,
          })
        }
        return a;
      },
      new Map<string, BadgeParams>()
    );

    return Array.from(commands.values());
}

const MAPPING = new Map<string, BadgeType>([
    ['Staff', 'staff'],
    ['Sponsor, Accès Expo', 'sponsor'],
    ['Speakers', 'speaker'],
    ['Conférence', 'attendee'],
    ['Université et Conférence', 'attendee'],
    ['Sponsor, Accès Conférence', 'attendee'],
]);

export function typeMapping(input: string): BadgeType | undefined {
    return MAPPING.get(input);
}