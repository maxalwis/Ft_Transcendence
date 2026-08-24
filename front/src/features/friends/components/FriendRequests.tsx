export type FriendsRequestsProps = {
  setFriends: React.Dispatch<React.SetStateAction<string[]>>;
  requests: string[];
  setRequests: React.Dispatch<React.SetStateAction<string[]>>;
};

export default function FriendsRequests({
  setFriends,
  requests,
  setRequests,
}: FriendsRequestsProps) {
  function acceptRequest(request: string) {
    setFriends((currentFriends) => [...currentFriends, request]);
    setRequests((currentRequests) => currentRequests.filter((r) => r !== request));
  }

  function rejectRequest(request: string) {
    setRequests((currentRequests) => currentRequests.filter((r) => r !== request));
  }

  return (
    <div>
      <ul className="mt-2 space-y-1">
        {requests.map((request) => (
          <li
            key={request}
            className="flex items-center justify-between px-2 py-2 text-sm text-black"
          >
            <span>{request}</span>

            <div className="flex gap-2 absolute right-11">
              <button
                className="cursor-pointer border border-green-500 hover:text-white hover:bg-green-600 rounded-lg p-1"
                onClick={() => acceptRequest(request)}
              >
                Accept
              </button>
              <button
                className="cursor-pointer border border-red-500 hover:text-white hover:bg-red-600 rounded-lg p-1 bg"
                onClick={() => rejectRequest(request)}
              >
                Reject
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
