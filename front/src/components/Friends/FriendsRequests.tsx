export default function FriendsRequests() {
  const requests = ['Diana', 'Evan'];

  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Requests</h3>
      <ul className="mt-2 space-y-1">
        {requests.map((request) => (
          <li key={request} className="rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-200">
            {request}
          </li>
        ))}
      </ul>
    </div>
  );
}