# NCSSM Navigate — product context

## What it is

A student-facing utility for NCSSM-Durham. One place to find school resources,
discover Durham and student opportunities, report issues to Student Government,
and see what SG is doing about them.

**Core message:** Navigate helps students find what they need without having to
know which platform, department, or person to search for.

## Register

**Product.** The design serves the task. A student on a phone between classes
should get to the right link in under ten seconds. Delight is saved for moments;
consistency is the virtue.

## Users

NCSSM-Durham students. Mostly residential, mostly sharp and pragmatic, mostly
arriving on a phone with a specific question: who do I email about the broken
dryer, where is the transcript form, when does the dining hall close.

Secondary: the handful of SG officers who maintain content at `/admin`.

## Scene

A sophomore standing in a hallway between classes, phone in hand under bright
fluorescent light, trying to work out who to contact about a broken radiator
before the bell. Bright ambient light, glance-and-go, one-handed.

That scene forces **light theme by default**, with dark supported for dorm-room
use at night.

## Tone

Plain, direct, and honest about limits. Written by students for students, not by
an institution at them.

The site says what SG *cannot* do as prominently as what it can. It labels its
own seed data as unconfirmed. It refuses a submission it cannot store rather
than pretending to have received it. Trustworthiness here comes from
under-promising, not from polish.

## Anti-references

- **A school administration portal.** Navy-and-white, logo lockups, press-release
  voice, "Student Services Portal" naming.
- **A generic SaaS dashboard.** Rounded purple cards on grey, hero metric tiles,
  icon-heading-text grids repeated down the page.
- **Anything childish.** These are students who take multivariable calculus.
- **Anything that over-promises.** A status board that implies every issue gets
  solved is worse than no status board.

## Strategic principles

1. **Link out, never absorb.** Navigate points at official systems and sends
   students there to authenticate. It never proxies, caches, or stores anything
   behind an NCSSM login.
2. **No login to use it.** The public directories work for everyone, with no
   account and no new password.
3. **Never silently drop a submission.** If it cannot be stored, say so and give
   the student another route.
4. **Nothing private ever becomes public.** Public status entries are written
   from scratch by SG, not derived from what a student wrote.
5. **Content is data.** Everything editable lives in `src/content/`, separate
   from presentation, so it can be replaced without touching the UI.
