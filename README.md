# FitForge Launchpad

this should be the logo of the website
beside the logo at the top should be this text
VYBE Fitness
Your fitness. Your VYBE.
FitForge — Premium Gym Platform (Phase 1)

Public marketing site + full authentication with role-based signup and admin approval, powered by Lovable Cloud.

The goal of this phase is to establish a polished public-facing website, secure authentication foundation, role system, account approval workflow, and database architecture that can be extended cleanly in later phases.

Do not expand the scope beyond the features explicitly listed below.

What Gets Built

Public Website

Create a shared premium navbar and footer.

Navbar:

Logo

Home

About

Membership

Trainers

Classes

Contact

Login

Join Now

Each page should have its own route.

Home

Create a premium landing page containing:

Full-bleed hero with high-quality generated gym imagery

Strong headline

Supporting text

"Join Now" CTA

"View Membership Plans" CTA

Gym introduction

Transformation/fitness message

Featured trainers

Popular classes

Membership highlights

Testimonials

AI fitness assistant teaser

Closing CTA

The AI assistant section is promotional only in Phase 1. Do not implement the actual AI assistant yet.

About

Include:

Gym story

Mission

Facilities

Training philosophy

Equipment overview

Use high-quality facility and equipment imagery.

Membership

Create:

Membership pricing cards

Plan name

Price

Features

Benefits

"Recommended" badge

Benefits comparison table

Join CTA

Do not implement payment processing in this phase.

Trainers

Create trainer cards containing:

Professional trainer photo

Name

Experience

Certifications

Specialties

Body areas trained

Read approved trainers from the database.

Seed demo trainers so the page is never empty.

Trainer imagery should look professional and fitness-related.

Classes

Create visual class cards containing:

Class image

Class name

Description

Trainer

Schedule

Difficulty

Age group

Target body area

Seed classes such as:

Strength Training

HIIT

Yoga

Cardio

Functional Training

Other relevant fitness classes

The class imagery should visually represent people performing the type of exercise associated with that class.

Do not implement class booking in Phase 1.

Contact

Create:

Contact form

Name

Email

Phone

Message

Location

Business information

Opening hours

Validate the form and store submissions in the database.

Registration and Approval

When a visitor clicks:

Join Now

open a role-selection screen with two options:

Join as Member

Allow the user to register as a gym member.

Join as Trainer

Allow the user to apply as a trainer.

The two options should be presented as polished visual cards.

Member Registration

Fields:

First name

Last name

Username

Email

Phone

Age

Gender (optional)

Password

Confirm password

After signup:

Create the authenticated user.

Assign the member role.

Set account status to pending.

Do not grant access to member features.

Send the user to a professional "Pending Approval" screen.

The user may have an authenticated session, but pending users must not be able to access protected role features.

Trainer Registration

Fields:

First name

Last name

Username

Email

Phone

Age

Password

Confirm password

Years of experience

Certifications

Specialties

Areas of expertise

Profile image

Allow the trainer to upload their profile image using Lovable Cloud Storage.

After signup:

Create the authenticated user.

Assign the trainer role.

Set account status to pending.

Do not grant access to trainer features.

Send the user to a professional "Application Pending" screen.

Account Statuses

Support these account statuses:

Pending

Approved

Rejected

Suspended

Behavior:

Pending

Show an approval-pending screen.

Do not allow access to protected member/trainer features.

Approved

Allow access to the appropriate role landing page.

Rejected

Show a clear explanatory rejection screen.

Do not allow access to protected role features.

Suspended

Show a clear explanatory suspension screen.

Do not allow access to protected role features.

Authentication

Implement:

Registration

Login

Logout

Password reset

Password reset request page

/reset-password page

Session persistence

Session-aware navigation

When logged out:

Show:

Login

Join Now

When logged in:

Show an avatar/profile menu with appropriate account actions.

Role System

Create three roles:

member

trainer

admin

Store roles in a separate user_roles table.

Do NOT store the user's role directly on the profile as the source of authorization truth.

Use a secure server-side/security-definer authorization function such as:

has_role()

to check permissions.

Users must never be able to grant themselves the admin role.

Protected Access

Implement protected route/access gating.

A user must satisfy BOTH conditions:

Have the appropriate role.

Have an approved account status.

Examples:

A pending member cannot access the member area.

A rejected trainer cannot access the trainer area.

A suspended member cannot access member features.

A member cannot access trainer or admin functionality.

A trainer cannot access admin functionality.

Admin access must be server-side enforced and not merely hidden in the UI.

Admin Approval Console

Create:

/admin/approvals

This is the first administrative feature required in Phase 1.

The page should contain a queue of pending:

Members

Trainers

Display submitted information.

For members:

Name

Email

Phone

Age

Gender

Registration date

Status

For trainers:

Name

Email

Phone

Age

Years of experience

Certifications

Specialties

Areas of expertise

Profile image

Registration date

Status

Admin actions:

Approve

Reject

Suspend

Record every approval action in an audit trail.

Audit information should include:

User/application affected

Action

Admin who performed the action

Timestamp

The approval console must be accessible only to admins.

Authorization must be enforced server-side.

Placeholder Role Landings

Create ONLY minimal placeholder landing pages for approved members and trainers.

Do not build the actual dashboards yet.

Approved Member Landing

Display:

Welcome message

Member's name

Account status

Short message such as:
"Your personalized fitness experience is coming in the next phase."

Logout button

Approved Trainer Landing

Display:

Welcome message

Trainer's name

Account status

Short message such as:
"Your trainer dashboard is coming in the next phase."

Logout button

These are placeholders only.

Do not implement:

Fitness assessment

Workout plans

Class booking

Progress tracking

Trainer/member management

Messaging

Attendance

Personalized recommendations

Those belong to later phases.

Design Direction

Use a:

Luxury Gym + Modern SaaS

visual direction.

Design characteristics:

Deep charcoal base

One bold energy accent

Large editorial typography

Generous spacing

Strong visual hierarchy

Premium cards

High-quality fitness photography

Subtle shadows

Restrained motion

Smooth transitions

Clean responsive layouts

Use semantic design tokens rather than scattering hard-coded styling values throughout the application.

The interface should feel like a real premium fitness brand, not a generic gym template.

Image and Visual Requirements

Use high-quality fitness imagery throughout the public website.

Hero

Premium gym environment and/or people actively training.

Trainers

Professional fitness trainer portraits.

Classes

Images should show people performing exercises associated with the class.

For example:

Strength:
People performing resistance training.

HIIT:
People performing high-intensity exercises.

Yoga:
People performing yoga/stretching.

Cardio:
People running, cycling, or doing cardio activities.

Equipment

Use professional images of equipment such as:

Dumbbells

Barbells

Cable machines

Squat racks

Leg press machines

Treadmills

Facilities

Use premium modern gym interiors and training spaces.

Images should be responsive and use appropriate cropping/object-fit behavior.

Use placeholders where necessary, but structure the system so images can later be replaced through Lovable Cloud Storage.

Animations

Add subtle premium animations such as:

Hero entrance animations

Scroll reveal

Card hover effects

Button transitions

Image hover effects

Navbar transitions

Smooth section transitions

Do not overuse animations.

Prioritize performance and usability.

Technical Architecture

Use Lovable Cloud for:

Authentication

Postgres database

Storage

Server functions

Configure authentication with email auto-confirmation enabled for this development phase.

Use secure authentication and authorization practices.

Database

Create the following tables/models:

gyms

For future multi-gym support.

profiles

Auto-created through a signup trigger.

Include appropriate profile information such as:

user_id

first_name

last_name

username

email

phone

age

gender

profile_image

account_status

gym_id

created_at

updated_at

Do not use the profile table as the source of truth for authorization roles.

user_roles

Fields should support:

user_id

role

gym_id

created_at

trainer_profiles

Include:

user_id

years_of_experience

certifications

specialties

areas_of_expertise

profile_image

gym_id

classes

Include:

name

description

image

trainer

schedule

difficulty

age_group

target_body_area

gym_id

membership_plans

Include:

name

price

features

benefits

recommended

gym_id

contact_messages

Include:

name

email

phone

message

created_at

gym_id

approval_events

Include:

affected_user

admin_user

action

timestamp

gym_id

Security and RLS

Every relevant table must have explicit grants and Row Level Security policies.

Users should only be able to read/update information they are authorized to access.

Public reads should be limited to appropriate public information such as:

Approved trainers

Published classes

Published membership plans

Approval actions must be admin-only.

Admin authorization must be enforced server-side.

Do not rely on hiding buttons or routes in the frontend as a security mechanism.

Use secure authorization functions such as has_role() where appropriate.

Storage

Create a Lovable Cloud Storage bucket for trainer profile images.

Implement:

Per-user upload policies

Appropriate file validation

Public read access where appropriate

Secure upload behavior

Structure storage so it can later support:

Trainers

Classes

Equipment

Exercises

Members

Website assets

Validation

Use Zod validation for forms.

Validate both:

Client-side

Server-side

Handle:

Required fields

Invalid email

Invalid age

Weak passwords

Password mismatch

Duplicate usernames

Duplicate emails

Invalid uploads

Upload failures

Database failures

Never expose raw database errors to users.

Display clear, user-friendly error messages.

Multi-Gym Readiness

The application should be structured for future multi-gym SaaS expansion.

Create a gyms table.

Gym-scoped entities should have a gym_id.

For Phase 1:

Create one default gym.

Seed all current demo data under that gym.

Do not build the full multi-gym administration interface yet.

Simply ensure the database architecture does not need to be rebuilt later to support multiple gyms.

Seed Data

Seed the database with realistic demo data so the public website does not appear empty.

Include:

Demo trainers

Demo classes

Demo membership plans

Use appropriate images/placeholders for the demo content.

Only approved trainers should appear publicly.

Admin Setup

Do NOT hard-code or assume an admin email.

Do NOT place an admin email directly into the frontend or source code.

Create the secure role-based admin system, but leave the initial admin-role assignment to a secure post-deployment configuration step.

Admin authorization must always be enforced server-side.

NOT IN PHASE 1

Do NOT build:

Fitness assessment

Fitness recommendation engine

Personalized workout plans

Member dashboard functionality

Trainer dashboard functionality

Admin management dashboard beyond approval console

Class booking

Attendance tracking

Progress tracking

AI chatbot

OpenAI integration

ElevenLabs integration

AI knowledge base

Advanced analytics

Payments

Subscription processing

Advanced messaging

These features will be implemented in later phases.

Do not expand the scope beyond Phase 1.

Responsive Design

The complete Phase 1 experience must work properly on:

Desktop

Laptop

Tablet

Mobile

Pay particular attention to:

Navigation

Hero section

Trainer cards

Class cards

Membership cards

Forms

Authentication pages

Approval console

Placeholder role pages

Phase 1 Completion Criteria

Consider Phase 1 complete only when all of the following work correctly:

Public website pages render correctly.

Home, About, Membership, Trainers, Classes, and Contact routes work.

Navigation works across public pages.

Mobile navigation works.

Premium responsive design is implemented.

Trainer, class, equipment, facility, and hero imagery display correctly.

Member registration works.

Trainer registration works.

Trainer profile image upload works.

Supabase/Lovable Cloud authentication works.

Login works.

Logout works.

Password reset works.

User roles are correctly assigned.

New member/trainer accounts start as pending.

Pending users cannot access protected role features.

Approved members can access their minimal member placeholder.

Approved trainers can access their minimal trainer placeholder.

Rejected users see the rejection state.

Suspended users see the suspension state.

Members cannot access trainer/admin functionality.

Trainers cannot access admin functionality.

Admins can securely access /admin/approvals.

Admins can approve applications.

Admins can reject applications.

Admins can suspend accounts.

Approval actions are recorded in the audit trail.

RLS policies prevent unauthorized database access.

Server-side authorization prevents unauthorized approval actions.

Seeded trainers, classes, and membership plans display correctly.

Contact form validation works.

Contact submissions are stored correctly.

No admin email is hard-coded.

No Phase 2+ features are accidentally implemented.

The architecture is ready for the next phase without requiring a rebuild.

Prioritize:

Security

Correct authentication and authorization

Database integrity

Responsive behavior

UI polish

Performance

Maintainable architecture

Do not add unnecessary features simply to make the first build larger.

Build a stable, polished foundation that can be extended in Phase 2.

PHASE 1 — Public Website + Branding + Authentication

Goal:

Create the professional gym website and user onboarding system.

Features to build:

Landing page

About page

Membership page

Trainers page

Classes page

Contact page

Join Now flow

Member/Trainer registration

Login

Account approval status

References

1. Gym Landing Page

Equinox
https://www.equinox.com/

Study:

Premium gym feeling

Hero sections

Typography

Image usage

Luxury branding

Barry's Bootcamp
https://www.barrys.com/

Study:

Fitness energy

Class presentation

Membership marketing

F45 Training
https://f45training.com/

Study:

Modern fitness branding

Class-focused design

2. Membership Page

Planet Fitness
https://www.planetfitness.com/

Study:

Membership cards

Pricing comparison

Benefits

Anytime Fitness
https://www.anytimefitness.com/

Study:

Membership journey

Location/gym presentation

3. Authentication Flow

References:

Airbnb
https://www.airbnb.com/

Study:

Sign-up simplicity

User onboarding

Linear
https://linear.app/

Study:

Clean SaaS authentication

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://vybe-fitness.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/bf55022e-4397-440f-a36a-b7316805be26).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
