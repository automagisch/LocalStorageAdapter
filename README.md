LocalStorageAdapter
===================

LocalStorageAdapter is for managing localStorage including callbacks by events etc. The reason: In LocalStorage it is only possible to include a single value. So let's say you'd like to insert an object with child objects, that won't be possible. This javascript tool will help you to do so, with a little help from the javascript JSON API. You can just add items to its own local data scope, and once save() is called, the JSON api stringifies that and put it into local storage. Also, LocalStorageAdapter is able to init existing data (because otherwise this would be useless (after all, that is why they invented LocalStorage). Documentation follows pretty soon.
