import { useEffect, useState } from "react";
import {
  Check,
  Clock3,
  MapPin,
  Search,
  UserCheck,
  UserMinus,
  UserPlus,
  UsersRound,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function Connect() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] =
    useState("discover");

  const [members, setMembers] =
    useState([]);

  const [incomingRequests, setIncomingRequests] =
    useState([]);

  const [sentRequests, setSentRequests] =
    useState([]);

  const [connections, setConnections] =
    useState([]);

  const [filters, setFilters] = useState({
  first_name: "",
  last_name: "",
  college_workplace: "",
  role: "",
  dietary_preference: "",
  location: "",
  postcode: "",
});

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const API_BASE =
    import.meta.env.VITE_BACKEND_URL ||
    "http://127.0.0.1:8000";

  function updateFilter(field, value) {
  setFilters((currentFilters) => ({
    ...currentFilters,
    [field]: value,
  }));
}

  function getMediaUrl(path) {
    if (!path) {
      return "";
    }

    if (
      path.startsWith("http://") ||
      path.startsWith("https://")
    ) {
      return path;
    }

    return `${API_BASE}${path}`;
  }

  function getMemberName(member) {
    return (
      member?.full_name ||
      [member?.first_name, member?.last_name]
        .filter(Boolean)
        .join(" ") ||
      member?.email ||
      "FoodKindl Member"
    );
  }

  function getMemberInitial(member) {
    return getMemberName(member)
      .charAt(0)
      .toUpperCase();
  }

  function getMemberPhoto(member) {
    return getMediaUrl(
      member?.profile?.profile_image_1
    );
  }

  function getOtherMember(connection) {
    if (
      connection.sender?.id === user?.id
    ) {
      return connection.receiver;
    }

    return connection.sender;
  }

  function getErrorMessage(data) {
    if (!data) {
      return "The request could not be completed.";
    }

    if (typeof data === "string") {
      return data;
    }

    return (
      data?.receiver_id?.[0] ||
      data?.non_field_errors?.[0] ||
      data?.detail ||
      "The request could not be completed."
    );
  }

  async function loadMembers(customFilters = filters) {
  setError("");

  try {
    const response = await api.get(
      "/members/",
      {
        params: {
          first_name:
            customFilters.first_name.trim(),

          last_name:
            customFilters.last_name.trim(),

          college_workplace:
            customFilters.college_workplace.trim(),

          role:
            customFilters.role.trim(),

          dietary_preference:
            customFilters.dietary_preference,

          location:
            customFilters.location.trim(),

          postcode:
            customFilters.postcode.trim(),
        },
      }
    );

    const memberList =
      response.data?.results ||
      response.data;

    setMembers(
      Array.isArray(memberList)
        ? memberList
        : []
    );
  } catch (requestError) {
  console.error(
    "Unable to load members:",
    requestError.response?.status,
    requestError.response?.data ||
      requestError
  );

  const data = requestError.response?.data;

  setError(
    data?.detail ||
      data?.message ||
      (typeof data === "string"
        ? data
        : JSON.stringify(data)) ||
      "Registered members could not be loaded."
  );
}
}

  async function loadConnections() {
    try {
      const [
        incomingResponse,
        sentResponse,
        acceptedResponse,
      ] = await Promise.all([
        api.get(
          "/connections/incoming/"
        ),
        api.get(
          "/connections/sent/"
        ),
        api.get(
          "/connections/accepted/"
        ),
      ]);

      setIncomingRequests(
        incomingResponse.data?.results ||
          incomingResponse.data ||
          []
      );

      setSentRequests(
        sentResponse.data?.results ||
          sentResponse.data ||
          []
      );

      setConnections(
        acceptedResponse.data?.results ||
          acceptedResponse.data ||
          []
      );
    } catch (requestError) {
      console.error(requestError);

      setError(
        "Connection details could not be loaded."
      );
    }
  }

  async function loadPage() {
    setLoading(true);
    setError("");

    await Promise.all([
      loadMembers(),
      loadConnections(),
    ]);

    setLoading(false);
  }

  useEffect(() => {
    loadPage();
  }, []);

  async function searchMembers(event) {
  event.preventDefault();

  setLoading(true);
  setError("");
  setMessage("");

  await loadMembers();

  setLoading(false);
}

async function clearFilters() {
  const clearedFilters = {
    first_name: "",
    last_name: "",
    college_workplace: "",
    role: "",
    dietary_preference: "",
    location: "",
    postcode: "",
  };

  setFilters(clearedFilters);
  setLoading(true);
  setError("");
  setMessage("");

  await loadMembers(clearedFilters);

  setLoading(false);
}

  async function sendRequest(memberId) {
    setError("");
    setMessage("");

    try {
      await api.post(
        "/connections/",
        {
          receiver_id: memberId,
        }
      );

      setMessage(
        "Connection request sent."
      );

      await loadPage();
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError.response?.data
        )
      );
    }
  }

  async function acceptRequest(connectionId) {
    try {
      await api.post(
        `/connections/${connectionId}/accept/`
      );

      setMessage(
        "Connection request accepted."
      );

      await loadPage();
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError.response?.data
        )
      );
    }
  }

  async function declineRequest(connectionId) {
    try {
      await api.post(
        `/connections/${connectionId}/decline/`
      );

      setMessage(
        "Connection request declined."
      );

      await loadPage();
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError.response?.data
        )
      );
    }
  }

  async function cancelRequest(connectionId) {
    try {
      await api.post(
        `/connections/${connectionId}/cancel/`
      );

      setMessage(
        "Connection request cancelled."
      );

      await loadPage();
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError.response?.data
        )
      );
    }
  }

  async function removeConnection(connectionId) {
    const confirmed = window.confirm(
      "Remove this member from your connections?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.post(
        `/connections/${connectionId}/remove/`
      );

      setMessage(
        "Connection removed."
      );

      await loadPage();
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError.response?.data
        )
      );
    }
  }

  function renderMemberAvatar(member) {
    const photo = getMemberPhoto(member);

    if (photo) {
      return (
        <img
          src={photo}
          alt={getMemberName(member)}
          className="connect-member-photo"
        />
      );
    }

    return (
      <div className="connect-member-placeholder">
        {getMemberInitial(member)}
      </div>
    );
  }

  function renderMemberDetails(member) {
    const profile = member?.profile || {};

    return (
      <>
        <h3>{getMemberName(member)}</h3>

        {profile.role && (
          <p className="connect-member-role">
            {profile.role}
          </p>
        )}

        {(profile.city ||
          profile.locality) && (
          <p className="connect-member-location">
            <MapPin size={15} />

            {[
              profile.locality,
              profile.city,
            ]
              .filter(Boolean)
              .join(", ")}
          </p>
        )}

        {profile.college_workplace && (
          <p>
            {profile.college_workplace}
          </p>
        )}

        {profile.dietary_preference &&
          profile.dietary_preference !==
            "none" && (
            <span className="connect-preference">
              {
                profile.dietary_preference
              }
            </span>
          )}
      </>
    );
  }

  if (loading) {
    return (
      <main className="app-page">
        <div className="app-panel">
          Loading FoodKindl members...
        </div>
      </main>
    );
  }

  return (
    <main className="app-page">
      <div className="app-heading">
        <div>
          <div className="eyebrow left">
            FoodKindl Connect
          </div>

          <h1>Discover and connect</h1>

          <p>
            Find FoodKindl members, manage
            connection requests, and build your
            food community.
          </p>
        </div>
      </div>

      <div className="connect-tabs">
        <button
          type="button"
          className={
            activeTab === "discover"
              ? "connect-tab active"
              : "connect-tab"
          }
          onClick={() =>
            setActiveTab("discover")
          }
        >
          <Search size={18} />
          Discover Members
        </button>

        <button
          type="button"
          className={
            activeTab === "requests"
              ? "connect-tab active"
              : "connect-tab"
          }
          onClick={() =>
            setActiveTab("requests")
          }
        >
          <UserPlus size={18} />
          Requests
          {incomingRequests.length > 0 && (
            <span className="connect-count">
              {incomingRequests.length}
            </span>
          )}
        </button>

        <button
          type="button"
          className={
            activeTab === "connections"
              ? "connect-tab active"
              : "connect-tab"
          }
          onClick={() =>
            setActiveTab("connections")
          }
        >
          <UsersRound size={18} />
          My Connections
        </button>
      </div>

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

      {message && (
        <p className="form-message">
          {message}
        </p>
      )}

      {activeTab === "discover" && (
        <section>
          <form
  className="app-panel connect-filter-form"
  onSubmit={searchMembers}
>
  <div className="connect-filter-grid">
    <label>
      First name
      <input
        type="text"
        value={filters.first_name}
        onChange={(event) =>
          updateFilter(
            "first_name",
            event.target.value
          )
        }
        placeholder="First name"
      />
    </label>

    <label>
      Last name
      <input
        type="text"
        value={filters.last_name}
        onChange={(event) =>
          updateFilter(
            "last_name",
            event.target.value
          )
        }
        placeholder="Last name"
      />
    </label>

    <label>
      College or workplace
      <input
        type="text"
        value={filters.college_workplace}
        onChange={(event) =>
          updateFilter(
            "college_workplace",
            event.target.value
          )
        }
        placeholder="Scaler, university, company..."
      />
    </label>

    <label>
      Role
      <input
        type="text"
        value={filters.role}
        onChange={(event) =>
          updateFilter(
            "role",
            event.target.value
          )
        }
        placeholder="Student, engineer, chef..."
      />
    </label>

    <label>
      Food preference
      <select
        value={filters.dietary_preference}
        onChange={(event) =>
          updateFilter(
            "dietary_preference",
            event.target.value
          )
        }
      >
        <option value="">
          All preferences
        </option>

        <option value="none">
          No preference
        </option>

        <option value="vegetarian">
          Vegetarian
        </option>

        <option value="vegan">
          Vegan
        </option>

        <option value="halal">
          Halal
        </option>

        <option value="keto">
          Keto
        </option>

        <option value="pescatarian">
          Pescatarian
        </option>

        <option value="gluten_free">
          Gluten-free
        </option>
      </select>
    </label>

    <label>
      Location
      <input
        type="text"
        value={filters.location}
        onChange={(event) =>
          updateFilter(
            "location",
            event.target.value
          )
        }
        placeholder="City or locality"
      />
    </label>

    <label>
      Postcode
      <input
        type="text"
        value={filters.postcode}
        onChange={(event) =>
          updateFilter(
            "postcode",
            event.target.value
          )
        }
        placeholder="560001"
      />
    </label>
  </div>

  <div className="connect-filter-actions">
    <button
      type="submit"
      className="primary-button"
    >
      <Search size={18} />
      Search Members
    </button>

    <button
      type="button"
      className="secondary-button"
      onClick={clearFilters}
    >
      Show All Members
    </button>
  </div>
</form>

          <div className="connect-member-grid">
            {members.length === 0 ? (
              <div className="app-panel">
                No members matched your search.
              </div>
            ) : (
              members.map((member) => (
                <article
                  className="connect-member-card"
                  key={member.id}
                >
                  {renderMemberAvatar(member)}

                  <div className="connect-member-info">
                    {renderMemberDetails(
                      member
                    )}

                    <div className="connect-card-actions">
                      <Link
                        to={`/connect/member/${member.id}`}
                        className="secondary-button"
                      >
                        View Profile
                      </Link>

                      {member.connection_status ===
                        "none" && (
                        <button
                          type="button"
                          className="primary-button"
                          onClick={() =>
                            sendRequest(
                              member.id
                            )
                          }
                        >
                          <UserPlus size={17} />
                          Connect
                        </button>
                      )}

                      {member.connection_status ===
                        "request_sent" && (
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() =>
                            cancelRequest(
                              member.connection_id
                            )
                          }
                        >
                          <Clock3 size={17} />
                          Request Sent
                        </button>
                      )}

                      {member.connection_status ===
                        "request_received" && (
                        <button
                          type="button"
                          className="primary-button"
                          onClick={() =>
                            setActiveTab(
                              "requests"
                            )
                          }
                        >
                          Review Request
                        </button>
                      )}

                      {member.connection_status ===
                        "connected" && (
                        <span className="connected-badge">
                          <UserCheck size={17} />
                          Connected
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      )}

      {activeTab === "requests" && (
        <section className="connect-request-layout">
          <div>
            <div className="connect-section-heading">
              <h2>Incoming Requests</h2>
              <span>
                {incomingRequests.length}
              </span>
            </div>

            <div className="connect-list">
              {incomingRequests.length === 0 ? (
                <div className="app-panel">
                  No incoming requests.
                </div>
              ) : (
                incomingRequests.map(
                  (connection) => {
                    const member =
                      connection.sender;

                    return (
                      <article
                        className="connect-request-card"
                        key={connection.id}
                      >
                        {renderMemberAvatar(
                          member
                        )}

                        <div className="connect-request-info">
                          {renderMemberDetails(
                            member
                          )}

                          <div className="connect-card-actions">
                            <Link
                              to={`/connect/member/${member.id}`}
                              className="secondary-button"
                            >
                              View Profile
                            </Link>

                            <button
                              type="button"
                              className="primary-button"
                              onClick={() =>
                                acceptRequest(
                                  connection.id
                                )
                              }
                            >
                              <Check size={17} />
                              Accept
                            </button>

                            <button
                              type="button"
                              className="secondary-button"
                              onClick={() =>
                                declineRequest(
                                  connection.id
                                )
                              }
                            >
                              <X size={17} />
                              Decline
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  }
                )
              )}
            </div>
          </div>

          <div>
            <div className="connect-section-heading">
              <h2>Sent Requests</h2>
              <span>
                {sentRequests.length}
              </span>
            </div>

            <div className="connect-list">
              {sentRequests.length === 0 ? (
                <div className="app-panel">
                  No pending sent requests.
                </div>
              ) : (
                sentRequests.map(
                  (connection) => {
                    const member =
                      connection.receiver;

                    return (
                      <article
                        className="connect-request-card"
                        key={connection.id}
                      >
                        {renderMemberAvatar(
                          member
                        )}

                        <div className="connect-request-info">
                          {renderMemberDetails(
                            member
                          )}

                          <div className="connect-card-actions">
                            <Link
                              to={`/connect/member/${member.id}`}
                              className="secondary-button"
                            >
                              View Profile
                            </Link>

                            <button
                              type="button"
                              className="secondary-button"
                              onClick={() =>
                                cancelRequest(
                                  connection.id
                                )
                              }
                            >
                              <X size={17} />
                              Cancel Request
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  }
                )
              )}
            </div>
          </div>
        </section>
      )}

      {activeTab === "connections" && (
        <section>
          <div className="connect-section-heading">
            <h2>My Connections</h2>
            <span>
              {connections.length}
            </span>
          </div>

          <div className="connect-member-grid">
            {connections.length === 0 ? (
              <div className="app-panel">
                You do not have any connections yet.
              </div>
            ) : (
              connections.map(
                (connection) => {
                  const member =
                    getOtherMember(
                      connection
                    );

                  return (
                    <article
                      className="connect-member-card"
                      key={connection.id}
                    >
                      {renderMemberAvatar(
                        member
                      )}

                      <div className="connect-member-info">
                        {renderMemberDetails(
                          member
                        )}

                        <div className="connect-card-actions">
                          <Link
                            to={`/connect/member/${member.id}`}
                            className="primary-button"
                          >
                            View Profile
                          </Link>

                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                              removeConnection(
                                connection.id
                              )
                            }
                          >
                            <UserMinus size={17} />
                            Remove
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                }
              )
            )}
          </div>
        </section>
      )}
    </main>
  );
}