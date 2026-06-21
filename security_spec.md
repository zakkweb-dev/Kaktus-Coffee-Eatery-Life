# SECURITY SPECIFICATION

This specification outlines the data invariants, protective guidelines, and security payload validation scenarios to secure the Cafe Kaktus Firebase backend.

## 1. Data Invariants

*   **Public Read, Admin Write**: Visitors can read all operational, promotional, and branding collections (Menu, New Launch, Event, Galeri, Cabang, Custom Cake, Config, Hero Banners).
*   **Identities & RBAC**: Administrators are identified by having their `uid` in the `admins` collection with a verified role (`Owner` or `Manager`), or by being the bootstrapped user email (`alrazakiswar11@gmail.com`).
*   **Admin Write Privilege**: Under no circumstances can non-authenticated or normal authenticated users write to, delete from, or update the branding and product collections.
*   **Immutability of Key Identities**: Admin profile metadata is self-contained and users cannot escalate their own roles unless they are the bootstrapped admin.

---

## 2. "Dirty Dozen" Poison Payloads

Here are 12 specific JSON payloads designed to break our database rules which must be strictly rejected (Permission Denied):

1.  **Anonymous Product Insertion**: Create a new menu item as an unauthenticated visitor.
2.  **Product Shadow Update / Alteration**: Attempt to override price or change `isBestSeller` status of items by a non-admin.
3.  **Config Injection**: Change `linkGrabFood` or settings to a malicious URL by a non-admin.
4.  **Admin Privilege Escalation**: Create a self-asserted document in `/admins/{uid}` with `role: 'Owner'` as a normal registered user.
5.  **Event Hijacking / Sabotage**: Non-admin attempts to delete or modify events.
6.  **Unbounded String Injection (Denial of Wallet)**: Inject a 10MB string into a product name or custom cake path to inflate storage cost.
7.  **Custom Cake Deletion**: Non-admin attempts to wipe the custom cake collection.
8.  **Hero Banner Spoil**: Non-admin attempts to reorder hero banners.
9.  **Admin Impersonation**: Attempt to view other admin profiles in the `admins` collection as an anonymous user.
10. **Unauthenticated Image Upload Reference**: Point a product photo to an arbitrary external URL by unauthenticated malicious actor.
11. **Malicious ID Poisoning**: Write a document with an ID consisting of dangerous script tags or 20KB characters.
12. **Malicious Invalid Enum**: Inject a custom role format like `'SuperAdminGod'` instead of `'Owner'` or `'Manager'`.

---

## 3. Test Runner Design

All test requests matching any of the Dirty Dozen must result in `PERMISSION_DENIED` errors.
The production firestore security rules implemented in `/firestore.rules` will enforce these assertions perfectly.
