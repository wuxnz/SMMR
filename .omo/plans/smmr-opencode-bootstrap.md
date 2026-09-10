# SMMR OpenCode bootstrap plan

1. Surface the strict root `smmr` settings in the OpenCode-facing schema.
2. Record explicit opt-in and permission boundaries during plugin startup while
   leaving disabled configuration inert.
3. Test schema validation and existing plugin config loading, then document the
   remaining controller and skill integration boundary.
