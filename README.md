# Pizza Crew

Live site: https://n9464.github.io/pizza-crew/

Local preview: http://localhost:4173 while the local server is running.

To restart: open this folder in Terminal and run `npm start` (Node.js required). No installation or build step is needed.

## Using the planner

On your first visit, choose your name in the popup; this browser remembers it. You can change it below **The lineup**. Click **Join** on a week. Click **Joined** to leave. Three people is the minimum, not a signup limit. To sign up someone else, choose their name first. Name selection is a convenience, not a login.

The schedule starts October 2, 2026 and ends June 11, 2027. June 18 and June 24 were removed at the class’s request. It contains 30 fundraiser dates based on the supplied Voyageur calendar. Fridays with school closures move to Thursday; weeks with both Thursday and Friday closed have no fundraiser. May 14 remains available because the closure is only for early childhood programs.

After a fundraiser date, open **Past weeks → Attendance** and check everyone who actually helped. Confirmed attendance contributes to **Done**. Upcoming signups, including the current date, contribute to **Planned**. Dates use America/Edmonton. A warning appears when a person's planned total is at least 4 below the average of all eleven classmates.

## Shared saving

Uses the existing `foire-de-sciences` Firebase project in a separate `pizzaCrew2026Weeks` Firestore collection. The existing science-fair collections are untouched. Each week is a document; atomic array additions/removals avoid overwriting another classmate's concurrent signup. Changes update live through a Firestore listener.

The web configuration is public Firebase client configuration, copied from the existing science-fair project. No private admin credentials are included. This uses the project's existing database permissions. This simple class signup board does not authenticate names: anyone with database access can edit signups and attendance. Class authentication and restricted database rules should be considered before public hosting.

A local cache can display the last loaded schedule if Firebase is unavailable. It is not a substitute for shared saving. Connection failures and failed saves show a notification. Network-disconnected writes made in an active session remain pending until the connection returns. Internet is needed for cloud sync and initial Firebase SDK loading.

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
