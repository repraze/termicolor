<!-- Generated from port.ts - do not edit -->
# Termicolor for GNOME Terminal

Dark and light profiles for GNOME Terminal, installed through gsettings or dconf.

> **Needs testing.** This port hasn't been checked in GNOME Terminal yet. If you try it, please
> [report how it looks](https://github.com/repraze/termicolor/issues/new?template=port-test.yml&title=%5Btest%5D+GNOME+Terminal&port=gnome-terminal) with a screenshot - see [TESTING.md](../../TESTING.md).

## Install

**Script:** run `install.sh` to add *Termicolor Dark* and *Termicolor Light* profiles:

```sh
bash install.sh                 # both profiles
bash install.sh dark --default   # one profile, made the default
```

Re-running it updates the same profiles in place. Pick a profile in *Preferences* or from the
new-tab menu.

**dconf:** load a single profile by hand, then add its id to the profile list
(`org.gnome.Terminal.ProfilesList list`) so it shows up:

```sh
dconf load /org/gnome/terminal/legacy/profiles:/:46edc057-d8e6-4aa1-a6a2-3b83272ead24/ < termicolor-dark.dconf
```

The light profile's id is `5c7f0537-5c7f-4f86-8e09-fadd0a973257`.

## Files

- [`dist/install.sh`](dist/install.sh)
- [`dist/termicolor-dark.dconf`](dist/termicolor-dark.dconf)
- [`dist/termicolor-light.dconf`](dist/termicolor-light.dconf)
