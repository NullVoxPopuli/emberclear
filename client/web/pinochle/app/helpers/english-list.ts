export default function englishList(list: string[]) {
  let amount = list.length;

  if (amount > 2) {
    let [last, ...parts] = list.reverse();

    return `${parts.reverse().join(', ')}, and ${last}`;
  }

  return list.join(' and ');
}
