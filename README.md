# Pizza Crew

Live site: https://n9464.github.io/pizza-crew/

Local preview: http://localhost:4173 while the local server is running.

To restart: open this folder in Terminal and run `npm start` (Node.js required). No installation or build step is needed.

## Using the planner

On your first visit, choose your name in the popup; this browser remembers it. You can change it below **The lineup**. Click **Join** on a week. Click **Joined** to leave. Each week is limited to three people. Full weeks cannot accept another signup; joining is checked atomically in a Firestore transaction. To sign up someone else, choose their name first. Name selection is a convenience, not a login.

The schedule starts October 2, 2026 and ends June 11, 2027. June 18 and June 24 were removed at the class’s request. It contains 30 fundraiser dates based on the supplied Voyageur calendar. Fridays with school closures move to Thursday; weeks with both Thursday and Friday closed have no fundraiser. May 14 remains available because the closure is only for early childhood programs.

After a fundraiser date, open **Past weeks → Attendance** and check everyone who actually helped. Confirmed attendance contributes to **Done**. Upcoming signups, including the current date, contribute to **Planned**. Dates use America/Edmonton. A warning appears when a person's planned total is at least 4 below the average of all eleven classmates.

## Shared saving

Uses the existing `foire-de-sciences` Firebase project in a separate `pizzaCrew2026Weeks` Firestore collection. The existing science-fair collections are untouched. Each week is a document; Firestore transactions prevent concurrent signups from exceeding three people. Changes update live through a Firestore listener.

The web configuration is public Firebase client configuration, copied from the existing science-fair project. No private admin credentials are included. This uses the project's existing database permissions. This simple class signup board does not authenticate names: anyone with database access can edit signups and attendance. Class authentication and restricted database rules should be considered before public hosting.

A local cache can display the last loaded schedule if Firebase is unavailable. It is not a substitute for shared saving. Connection failures and failed saves show a notification. Signups require a live connection for the capacity check. Internet is needed for cloud sync and initial Firebase SDK loading.

The site is published through GitHub Pages from the `gh-pages` branch. For a phone on the same Wi-Fi, use this computer's local network IP with port 4173, and keep this computer and server running.

## Verification

Run `npm test` for school-calendar exceptions, date-aware participation counts, and the warning threshold. Browser checks also covered signup, removal, Firebase persistence, and responsive phone/laptop layouts. Test signups were removed afterward.

School calendar: https://voyageur.centreest.ca/wp-content/uploads/2026/08/Calendrier-Voyageur-2026-2027-FR.pdf

## Publishing updates

Commit changes on `main`, then publish the static folder:

```sh
git push origin main
git subtree split --prefix dist -b pages-release
git push origin pages-release:gh-pages
git branch -D pages-release
```

GitHub Pages serves the root of `gh-pages`.

## PDF export

Choose **Export PDF** below The lineup to download a three-page US Letter calendar covering October 2026 through June 2027. It includes the current crew names, available spots, closure weeks, and export date. Export becomes available after Firebase loads and any pending signup finishes. Files are generated in your browser using the bundled pdf-lib 1.17.1 (MIT), without sending calendar data to a PDF service.
