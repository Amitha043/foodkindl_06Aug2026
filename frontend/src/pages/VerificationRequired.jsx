import {
  CheckCircle2,
  Clock3,
  FileWarning,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { useEffect, useState } from "react";

import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function VerificationRequired() {
  const { user, refreshUser } = useAuth();

  const [idType, setIdType] = useState("");
  const [governmentId, setGovernmentId] =
    useState(null);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const profile = user?.profile || {};

  useEffect(() => {
    setIdType(
      profile.government_id_type || ""
    );
  }, [profile.government_id_type]);

  async function uploadGovernmentId(event) {
    event.preventDefault();

    if (!idType) {
      setError(
        "Select the Government ID type."
      );
      return;
    }

    if (!governmentId) {
      setError(
        "Select a Government ID document."
      );
      return;
    }

    setUploading(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();

      formData.append(
        "government_id_type",
        idType
      );

      formData.append(
        "government_id",
        governmentId
      );

      await api.patch(
        "/profile/",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      setGovernmentId(null);

      setMessage(
        "Government ID uploaded successfully. It is now awaiting admin approval."
      );

      if (refreshUser) {
        await refreshUser();
      }
    } catch (requestError) {
      console.error(
        "Government ID upload error:",
        requestError.response?.data ||
          requestError
      );

      const data =
        requestError.response?.data;

      setError(
        data?.government_id?.[0] ||
          data?.government_id_type?.[0] ||
          data?.detail ||
          "Government ID could not be uploaded."
      );
    } finally {
      setUploading(false);
    }
  }

  if (
    profile.verification_status ===
      "approved" &&
    profile.is_verified
  ) {
    return (
      <main className="app-page">
        <div className="verification-card">
          <CheckCircle2 size={54} />

          <h1>Identity verified</h1>

          <p>
            Your Government ID has been
            approved. Community and Connect are
            now available.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="app-page">
      <section className="verification-card">
        <div className="verification-icon">
          {profile.verification_status ===
          "pending" ? (
            <Clock3 size={48} />
          ) : profile.verification_status ===
            "rejected" ? (
            <FileWarning size={48} />
          ) : (
            <ShieldCheck size={48} />
          )}
        </div>

        <div className="eyebrow">
          FoodKindl Safety
        </div>

        <h1>
          Identity verification required
        </h1>

        <p>
          Upload a valid Government ID. Connect
          and Community will unlock after an
          administrator approves your document.
        </p>

        {profile.verification_status ===
          "pending" && (
          <div className="verification-status pending">
            <Clock3 size={20} />

            <div>
              <strong>
                Verification pending
              </strong>

              <span>
                Your document is awaiting
                administrator approval.
              </span>
            </div>
          </div>
        )}

        {profile.verification_status ===
          "rejected" && (
          <div className="verification-status rejected">
            <FileWarning size={20} />

            <div>
              <strong>
                Verification rejected
              </strong>

              <span>
                {profile.rejection_reason ||
                  "Please upload a clearer document."}
              </span>
            </div>
          </div>
        )}

        {message && (
          <p className="form-message">
            {message}
          </p>
        )}

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

        <form
          className="verification-form"
          onSubmit={uploadGovernmentId}
        >
          <label>
            Government ID type

            <select
              value={idType}
              onChange={(event) =>
                setIdType(
                  event.target.value
                )
              }
              required
            >
              <option value="">
                Select ID type
              </option>

              <option value="aadhaar">
                Aadhaar Card
              </option>

              <option value="passport">
                Passport
              </option>

              <option value="driving_licence">
                Driving Licence
              </option>

              <option value="voter_id">
                Voter ID
              </option>

              <option value="pan">
                PAN Card
              </option>

              <option value="other">
                Other
              </option>
            </select>
          </label>

          <label>
            Upload document

            <input
              type="file"
              accept="
                image/jpeg,
                image/png,
                image/webp,
                application/pdf
              "
              onChange={(event) =>
                setGovernmentId(
                  event.target.files?.[0] ||
                    null
                )
              }
              required
            />
          </label>

          <button
            type="submit"
            className="primary-button"
            disabled={uploading}
          >
            <Upload size={18} />

            {uploading
              ? "Uploading..."
              : profile.government_id_uploaded
                ? "Upload New Document"
                : "Upload Government ID"}
          </button>
        </form>
      </section>
    </main>
  );
}