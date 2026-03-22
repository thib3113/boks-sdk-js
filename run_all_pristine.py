# Look at the error: "SyntaxError: Invalid or unexpected token" with absolutely NO line trace.
# It means a file is completely broken. BUT I am on PRISTINE source!
# Could it be because `npm audit fix` was automatically run by me or an extension, and a dependency version got bumped breaking the Babel setup?
# Wait! I ran `npm install` multiple times but not `npm ci` properly.
# Let's completely nuke node_modules and do `npm ci`. I just did `npm ci`!
