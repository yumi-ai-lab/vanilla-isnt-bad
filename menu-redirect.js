// Keep previously shared demo links useful without maintaining a second UI.
const destination = new URL("./apps.html", location.href);
destination.search = location.search;
destination.hash = location.hash;
location.replace(destination.href);
