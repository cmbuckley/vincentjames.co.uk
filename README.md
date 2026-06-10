# Showcase Skeleton

This repository is used when creating a gh-pages branch for a [showcased project](https://cmbuckley.co.uk/projects/).

To use, create an orphaned gh-pages branch using this repository:

```bash
git remote add skel gh:cmbuckley/showcase-skeleton
git fetch skel
git checkout -b gh-pages skel/main
git remote rm skel
```

Then, convert the project's README.md into the showcase index.md and update the config/metadata as appropriate.
