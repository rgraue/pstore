# pstore

A simple cli password store

## getting started

pull down repo to local machine

then `./install.sh`

thats it.

## usage

`pstore` - from any terminal if installed successfully

then simple

- `add`
- `get <nickname>`
- `list`
- `exit`

its that simple


## things to not do

1. check in `db/` or `db.json`. pretty obvious. its encrypted, but really only at the password level, so still; be careful.

2. delete `db.json`. or do it if you want, im not ur mom.

3. use the same nickname for multiple entries. you can do this to overwrite things, but be smart ab it.

4. forget the master password. there is not provided recovery method.

