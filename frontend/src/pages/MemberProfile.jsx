import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  MapPin,
  MessageCircle,
  ShieldCheck,
  UserRound,
  Utensils,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function MemberProfile() {
  const { memberId } = useParams();
  const { user } = useAuth();

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messaging, setMessaging] = useState(false);
  const [error, setError] = useState("");

  const API_BASE =
    import.meta.env.VITE_BACKEND_URL ||
    "http://127.0.0.1:8000";

  function getMediaUrl(path) {
    if (!path) {
      return "";
    }

    if (
      path.startsWith("http://") ||
      path.startsWith("https://") ||
      path.startsWith("blob:")
    ) {
      return path;
    }

    return `${API_BASE}${path}`;
  }

  function getMemberName(currentMember) {
    return (
      currentMember?.full_name ||
      [
        currentMember?.first_name,
        currentMember?.last_name,
      ]
        .filter(Boolean)
        .join(" ") ||
      currentMember?.email ||
      "FoodKindl Member"
    );
  }

  function getErrorMessage(data) {
    if (!data) {
      return "The request could not be completed.";
    }

    if (typeof data === "string") {
      return data;
    }

    return (
      data?.user_id?.[0] ||
      data?.detail ||
      "The request could not be completed."
    );
  }

  useEffect(() => {
    async function loadMember() {
      setLoading(true);
      setError("");

      try {
        const response = await api.get(
          `/members/${memberId}/`
        );

        setMember(response.data);
      } catch (requestError) {
        console.error(
          "Unable to load member profile:",
          requestError.response?.status,
          requestError.response?.data ||
            requestError
        );

        if (requestError.response?.status === 404) {
          setError("This member was not found.");
        } else {
          setError(
            requestError.response?.data?.detail ||
              "Member profile could not be loaded."
          );
        }
      } finally {
        setLoading(false);
      }
    }

    if (memberId) {
      loadMember();
    }
  }, [memberId]);

  async function messageMember() {
    if (!member?.id) {
      return;
    }

    if (member.id === user?.id) {
      setError("You cannot message yourself.");
      return;
    }

    setMessaging(true);
    setError("");

    try {
      /*
       * This endpoint creates a new direct conversation
       * or returns an existing conversation between both users.
       */
      const response = await api.post(
        "/conversations/",
        {
          user_id: member.id,
        }
      );

      const conversation = response.data;

      /*
       * MessagingDock listens for this event and opens
       * the individual chat popup.
       */
      window.dispatchEvent(
        new CustomEvent("foodkindl:open-conversation", {
          detail: {
            conversation,
            member,
          },
        })
      );
    } catch (requestError) {
      console.error(
        "Unable to start conversation:",
        requestError.response?.status,
        requestError.response?.data ||
          requestError
      );

      setError(
        getErrorMessage(
          requestError.response?.data
        )
      );
    } finally {
      setMessaging(false);
    }
  }

  if (loading) {
    return (
      <main className="app-page">
        <div className="app-panel">
          Loading member profile...
        </div>
      </main>
    );
  }

  if (error && !member) {
    return (
      <main className="app-page">
        <p className="error-message">
          {error}
        </p>

        <Link
          to="/connect"
          className="secondary-button"
        >
          <ArrowLeft size={18} />
          Back to Connect
        </Link>
      </main>
    );
  }

  if (!member) {
    return null;
  }

  const profile = member.profile || {};

  const profileImage = getMediaUrl(
    profile.profile_image_1
  );

  const additionalImages = [
    profile.profile_image_2,
    profile.profile_image_3,
  ]
    .filter(Boolean)
    .map(getMediaUrl);

  const location = [
    profile.locality,
    profile.city,
  ]
    .filter(Boolean)
    .join(", ");

  const isOwnProfile =
    member.id === user?.id;

  return (
    <main className="member-profile-page">
      <div className="member-profile-container">
        <Link
          to="/connect"
          className="community-back-link"
        >
          <ArrowLeft size={18} />
          Back to Connect
        </Link>

        <section className="member-profile-hero">
          <div className="member-profile-photo-wrapper">
            {profileImage ? (
              <a
                href={profileImage}
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src={profileImage}
                  alt={getMemberName(member)}
                  className="member-profile-main-photo"
                />
              </a>
            ) : (
              <div className="member-profile-main-placeholder">
                <UserRound size={70} />
              </div>
            )}
          </div>

          <div className="member-profile-heading">
            <div className="eyebrow left">
              FoodKindl Member
            </div>

            <h1>{getMemberName(member)}</h1>

            {profile.role && (
              <p className="member-profile-role">
                {profile.role}
              </p>
            )}

            <div className="member-profile-actions">
              {member.connection_status ===
                "connected" && (
                <span className="connected-badge">
                  <ShieldCheck size={18} />
                  Connected
                </span>
              )}

              {!isOwnProfile && (
                <button
                  type="button"
                  className="primary-button"
                  onClick={messageMember}
                  disabled={messaging}
                >
                  <MessageCircle size={19} />

                  {messaging
                    ? "Opening chat..."
                    : "Message"}
                </button>
              )}
            </div>

            {error && (
              <p className="error-message">
                {error}
              </p>
            )}
          </div>
        </section>

        <section className="member-profile-details-grid">
          <article className="member-profile-detail-card">
            <MapPin size={22} />

            <div>
              <small>Location</small>

              <strong>
                {location ||
                  "Not provided"}
              </strong>

              {profile.postcode && (
                <span>
                  Postcode: {profile.postcode}
                </span>
              )}
            </div>
          </article>

          <article className="member-profile-detail-card">
            <Building2 size={22} />

            <div>
              <small>
                College or workplace
              </small>

              <strong>
                {profile.college_workplace ||
                  "Not provided"}
              </strong>
            </div>
          </article>

          <article className="member-profile-detail-card">
            <Utensils size={22} />

            <div>
              <small>Food preference</small>

              <strong>
                {profile.dietary_preference &&
                profile.dietary_preference !==
                  "none"
                  ? profile.dietary_preference.replaceAll(
                      "_",
                      " "
                    )
                  : "No preference"}
              </strong>
            </div>
          </article>
        </section>

        <section className="member-profile-content-grid">
          <article className="app-panel member-profile-about">
            <div className="eyebrow left">
              About
            </div>

            <h2>
              About {member.first_name ||
                "this member"}
            </h2>

            <p>
              {profile.bio ||
                "This member has not added a bio yet."}
            </p>

            {profile.interests && (
              <>
                <h3>Food interests</h3>
                <p>{profile.interests}</p>
              </>
            )}
          </article>

          {additionalImages.length > 0 && (
            <article className="app-panel">
              <div className="eyebrow left">
                More photos
              </div>

              <div className="member-profile-gallery">
                {additionalImages.map(
                  (image, index) => (
                    <a
                      href={image}
                      target="_blank"
                      rel="noreferrer"
                      key={image}
                    >
                      <img
                        src={image}
                        alt={`${getMemberName(
                          member
                        )} profile ${
                          index + 2
                        }`}
                      />
                    </a>
                  )
                )}
              </div>
            </article>
          )}
        </section>
      </div>
    </main>
  );
}