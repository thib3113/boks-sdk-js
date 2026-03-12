const fs = require('fs');
let code = fs.readFileSync('src/protocol/payload-mapper.ts', 'utf8');

// 1. Remplace l'appel dynamique moche par un appel propre statique
code = code.replace(/PayloadMapper\['assertSafeBounds'\]/g, 'PayloadMapper.assertSafeBounds');

// 2. Ajoute isValidIdentifier dans la classe PayloadMapper
const isValidIdentifierFn = `
  /**
   * Fast, regex-free validation of JavaScript identifiers.
   * Ensures the name only contains [a-zA-Z0-9_$] and doesn't start with a number.
   */
  private static isValidIdentifier(name: string): boolean {
    if (!name || name.length === 0) return false;

    // First char cannot be a number
    const firstCode = name.charCodeAt(0);
    const isFirstValid =
      (firstCode >= 65 && firstCode <= 90) || // A-Z
      (firstCode >= 97 && firstCode <= 122) || // a-z
      firstCode === 36 || // $
      firstCode === 95; // _

    if (!isFirstValid) return false;

    // Subsequent chars can also be numbers
    for (let i = 1; i < name.length; i++) {
      const code = name.charCodeAt(i);
      const isValid =
        (code >= 48 && code <= 57) || // 0-9
        (code >= 65 && code <= 90) || // A-Z
        (code >= 97 && code <= 122) || // a-z
        code === 36 || // $
        code === 95; // _

      if (!isValid) return false;
    }

    return true;
  }
`;

// Insérer la fonction avant assertSafePropertyName
code = code.replace(
  /private static assertSafePropertyName\(name: string\): void \{/,
  `${isValidIdentifierFn}\n  private static assertSafePropertyName(name: string): void {`
);

// 3. Remplacer le test regex par la nouvelle fonction
code = code.replace(
  /!\/^[a-zA-Z_$][0-9a-zA-Z_$]\*$\/\.test\(name\)/g,
  `!this.isValidIdentifier(name)`
);

fs.writeFileSync('src/protocol/payload-mapper.ts', code);
console.log('Optimisations appliquées');
