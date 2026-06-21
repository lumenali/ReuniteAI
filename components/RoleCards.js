const roles = [
  {
    title: "Reporter",
    text: "Can submit reports. Cannot browse leads."
  },
  {
    title: "Reviewer",
    text: "Checks evidence, conflicts, and missing info."
  },
  {
    title: "Coordinator",
    text: "Decides whether escalation is appropriate."
  }
];

export default function RoleCards() {
  return (
    <section className="grid gap-3 md:grid-cols-3" aria-label="Case desk roles">
      {roles.map((role) => (
        <article key={role.title} className="panel p-4">
          <p className="small-caps">{role.title}</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">{role.text}</p>
        </article>
      ))}
    </section>
  );
}
