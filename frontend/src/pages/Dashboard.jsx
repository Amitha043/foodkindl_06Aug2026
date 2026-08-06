import {
  LockKeyhole,
  MessageSquare,
  UserRound,
  UsersRound,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  const profile = user?.profile || {};

  const API_BASE =
    import.meta.env.VITE_BACKEND_URL ||
    "http://127.0.0.1:8000";

  function getProfileImageUrl(imagePath) {
    if (!imagePath) {
      return null;
    }

    if (
      imagePath.startsWith("http://") ||
      imagePath.startsWith("https://")
    ) {
      return imagePath;
    }

    return `${API_BASE}${imagePath}`;
  }

  const profileImage = getProfileImageUrl(
    profile.profile_image_1
  );

  const displayName =
    user?.first_name ||
    user?.full_name ||
    user?.email ||
    "FoodKindl Member";

  const isVerified =
    profile.is_verified === true &&
    profile.verification_status ===
      "approved";

  const verificationStatus =
    profile.verification_status ||
    "not_submitted";

  function getVerificationMessage() {
    if (verificationStatus === "pending") {
      return "Government ID approval is pending.";
    }

    if (verificationStatus === "rejected") {
      return "Government ID was rejected. Please upload a new document.";
    }

    return "Government ID verification is required.";
  }

  const cards = [
    {
      icon: <MessageSquare />,
      title: "CommuniQ",
      text: isVerified
        ? "Share food stories and connect with members."
        : getVerificationMessage(),
      path: isVerified
        ? "/community"
        : "/verification-required",
      locked: !isVerified,
    },
    {
      icon: <UsersRound />,
      title: "Connect",
      text: isVerified
        ? "Discover members, send connection requests, manage connections, and view profiles."
        : getVerificationMessage(),
      path: isVerified
        ? "/connect"
        : "/verification-required",
      locked: !isVerified,
    },
    {
      icon: <UserRound />,
      title: "Profile",
      text: "Update your city, preferences, Government ID, and safety controls.",
      path: "/profile",
      locked: false,
    },
  ];

  return (
    <main className="app-page">
      <section className="dashboard-hero dashboard-hero-with-profile">
        <div className="dashboard-hero-copy">
          <div className="eyebrow left">
            FoodKindl Connect
          </div>

          <h1>Welcome, {displayName}</h1>

          <p>
            What would you like to do today?
          </p>

          {!isVerified && (
            <Link
              to="/verification-required"
              className={`dashboard-verification-banner ${verificationStatus}`}
            >
              <LockKeyhole size={20} />

              <div>
                <strong>
                  {verificationStatus === "pending"
                    ? "Verification pending"
                    : verificationStatus === "rejected"
                      ? "Verification rejected"
                      : "Identity verification required"}
                </strong>

                <span>
                  {getVerificationMessage()}
                </span>
              </div>
            </Link>
          )}
        </div>

        <div className="dashboard-profile-visual">
          {profileImage ? (
            <img
              src={profileImage}
              alt={`${displayName}'s profile`}
              className="dashboard-profile-image"
              onError={(event) => {
                event.currentTarget.style.display =
                  "none";

                event.currentTarget
                  .nextElementSibling
                  ?.classList.remove("hidden");
              }}
            />
          ) : null}

          <div
            className={`dashboard-profile-placeholder ${
              profileImage ? "hidden" : ""
            }`}
          >
            <UserRound
              size={72}
              strokeWidth={1.4}
            />

            <span>
              No profile photo uploaded
            </span>

            <Link
              to="/profile"
              className="primary-button"
            >
              Add Profile Photo
            </Link>
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        {cards.map((card) => (
          <Link
            key={card.title}
            to={card.path}
            className={
              card.locked
                ? "dashboard-card locked"
                : "dashboard-card"
            }
          >
            <span className="icon-box">
              {card.locked ? (
                <LockKeyhole />
              ) : (
                card.icon
              )}
            </span>

            <h2>{card.title}</h2>

            <p>{card.text}</p>

            {card.locked && (
              <span className="dashboard-lock-label">
                <LockKeyhole size={15} />

                {verificationStatus === "pending"
                  ? "Awaiting admin approval"
                  : verificationStatus === "rejected"
                    ? "Upload another ID"
                    : "Verification required"}
              </span>
            )}
          </Link>
        ))}
      </section>
    </main>
  );
}