A shared app with inter-front-and-back types definitions for API communication
Something like this:

```typescript
 ???
```

# front

- Intro page with a banner, sign-in via usos button
- General signed-in page where we have a topbar, on the right side of which there is a
  avatar, hover allows for sign out.
- Page showing courses that you are registered to
- Page showing timeslots for a course. Clicking on a timeslot selects it for "Wanna buy".
  You can select multiple timeslots that you want to buy. Each timeslot also shows how
  many people of that timeslot are willing to buy your slot.
- Market page, where you see all available exchanges based on what people want to sell,
  and what you are willing to sell. Market page has filters.
  - When you open a market page in a default way, you a presented all matches based on
    yours and other's buy/sell preferences.
  - When on a timeslots page, you go to a certain timeslot market, you can see who want
    to sell that exact slot for YOUR SLOT.
  - So basically, filters are: Course, Course/Slot
  - Clicking on a market offer's "propose" button creates a chat.
- Chat.
  - Normal chat.
  - "Ready" button IS NOT NEEDED THERE IS NOTHING TO CHANGE ITS NOT A POKEMON TRADE
  - "Exchange" button
  - For future, circular changes will be group chats.
  - When change is submitted, you can see exchange in swaps tab.
  - (There should be constant validation on whether you are in possesion of a timeslot via USOS API)
- Swaps tab
  - Each swap you can "go to" chat that it was done on.
  - You can cancel a swap.
  - Once you swapped on a course, you cannot make other swaps on it
    Only after, when circular exchanges are introduced.
  - You can export your swaps to present to teacher.
    - Thing is, it is actually better to present a whole COURSE swaps to course teacher,
      so all the swaps of a course. There can be an auto generated mail that will be send from
      our server, but that's after MVP.

Start with setting up the structure and router
/ -> Info and sign-in OR
/dashboard
/dashboard/
