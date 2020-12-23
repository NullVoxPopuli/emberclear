# TODO

## Channels

The data structures needs to be reworked -- there are too many models and the
split doesn't provide much value as all the data is very tightly coupled and
it's a lot of 1:1 relationships

For example, there are 7 relationships on identity _just_ for channels.
Does it really need to exist on `Identity`? We don't super care what
other users' channels are -- we can't actually know that for certain anyway.

_Proposal_:
 - Move channel related things to the `User`.
 - Manage members on the `Channel`.
 - Manage votes on the `Channel`.
