/** Istanbul's 39 official municipalities; keys are stable URL identifiers, not inferred residence locations. */
export const istanbulDistricts = [
  ['adalar', 'Adalar'], ['arnavutkoy', 'Arnavutköy'], ['atasehir', 'Ataşehir'], ['avcilar', 'Avcılar'],
  ['bagcilar', 'Bağcılar'], ['bahcelievler', 'Bahçelievler'], ['bakirkoy', 'Bakırköy'], ['basaksehir', 'Başakşehir'],
  ['bayrampasa', 'Bayrampaşa'], ['besiktas', 'Beşiktaş'], ['beykoz', 'Beykoz'], ['beylikduzu', 'Beylikdüzü'],
  ['beyoglu', 'Beyoğlu'], ['buyukcekmece', 'Büyükçekmece'], ['catalca', 'Çatalca'], ['cekmekoy', 'Çekmeköy'],
  ['esenler', 'Esenler'], ['esenyurt', 'Esenyurt'], ['eyupsultan', 'Eyüpsultan'], ['fatih', 'Fatih'],
  ['gaziosmanpasa', 'Gaziosmanpaşa'], ['gungoren', 'Güngören'], ['kadikoy', 'Kadıköy'], ['kagithane', 'Kağıthane'],
  ['kartal', 'Kartal'], ['kucukcekmece', 'Küçükçekmece'], ['maltepe', 'Maltepe'], ['pendik', 'Pendik'],
  ['sancaktepe', 'Sancaktepe'], ['sariyer', 'Sarıyer'], ['silivri', 'Silivri'], ['sultanbeyli', 'Sultanbeyli'],
  ['sultangazi', 'Sultangazi'], ['sile', 'Şile'], ['sisli', 'Şişli'], ['tuzla', 'Tuzla'],
  ['umraniye', 'Ümraniye'], ['uskudar', 'Üsküdar'], ['zeytinburnu', 'Zeytinburnu'],
] as const;
export type DistrictKey = typeof istanbulDistricts[number][0];
export function districtName(key?: string) { return istanbulDistricts.find(([id]) => id === key)?.[1]; }
export function searchDistricts(query: string) {
  const normalize = (text: string) => text.toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ı/g, 'i');
  return istanbulDistricts.filter(([key, name]) => normalize(name).includes(normalize(query)) || key.includes(normalize(query)));
}