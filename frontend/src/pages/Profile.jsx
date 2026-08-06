import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";

const initialFiles = {
  profile_image_1: null,
  profile_image_2: null,
  profile_image_3: null,
  government_id: null,
};

export default function Profile() {
  const { user, reloadUser } = useAuth();
  const profile = user?.profile || {};

  const [form, setForm] = useState({
    bio: profile.bio || "",
    city: profile.city || "",
    locality: profile.locality || "",
    postcode: profile.postcode || "",
    college_workplace: profile.college_workplace || "",
    role: profile.role || "",
    interests: profile.interests || "",
    dietary_preference: profile.dietary_preference || "none",
    women_only_mode: profile.women_only_mode || false,
  });

  const [files, setFiles] = useState(initialFiles);

  const [previews, setPreviews] = useState({
    profile_image_1: profile.profile_image_1 || "",
    profile_image_2: profile.profile_image_2 || "",
    profile_image_3: profile.profile_image_3 || "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm({
      bio: profile.bio || "",
      city: profile.city || "",
      locality: profile.locality || "",
      postcode: profile.postcode || "",
      college_workplace: profile.college_workplace || "",
      role: profile.role || "",
      interests: profile.interests || "",
      dietary_preference: profile.dietary_preference || "none",
      women_only_mode: profile.women_only_mode || false,
    });

    setPreviews({
      profile_image_1: profile.profile_image_1 || "",
      profile_image_2: profile.profile_image_2 || "",
      profile_image_3: profile.profile_image_3 || "",
    });
  }, [user]);

  function handleInputChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleFileChange(event) {
    const { name, files: selectedFiles } = event.target;
    const selectedFile = selectedFiles?.[0];

    if (!selectedFile) {
      return;
    }

    setFiles((previousFiles) => ({
      ...previousFiles,
      [name]: selectedFile,
    }));

    if (name.startsWith("profile_image")) {
      const previewUrl = URL.createObjectURL(selectedFile);

      setPreviews((previousPreviews) => ({
        ...previousPreviews,
        [name]: previewUrl,
      }));
    }
  }

  async function submit(event) {
    event.preventDefault();

    setMessage("");
    setError("");
    setSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("bio", form.bio);
      formData.append("city", form.city);
      formData.append("locality", form.locality);
      formData.append("postcode", form.postcode);
      formData.append("college_workplace", form.college_workplace);
      formData.append("role", form.role);
      formData.append("interests", form.interests);
      formData.append(
        "dietary_preference",
        form.dietary_preference
      );

      formData.append(
        "women_only_mode",
        form.women_only_mode ? "true" : "false"
      );

      if (files.profile_image_1) {
        formData.append(
          "profile_image_1",
          files.profile_image_1
        );
      }

      if (files.profile_image_2) {
        formData.append(
          "profile_image_2",
          files.profile_image_2
        );
      }

      if (files.profile_image_3) {
        formData.append(
          "profile_image_3",
          files.profile_image_3
        );
      }

      if (files.government_id) {
        formData.append(
          "government_id",
          files.government_id
        );
      }

      const response = await api.patch(
        "/auth/profile/",
        formData
      );

      console.log("Saved profile:", response.data);

      await reloadUser();

      setFiles(initialFiles);

      setMessage(
        "Your profile and uploaded files have been saved successfully."
      );
    } catch (requestError) {
      console.error(
        "Profile update error:",
        requestError.response?.data || requestError
      );

      const data = requestError.response?.data;

      setError(
        data?.profile_image_1?.[0] ||
          data?.profile_image_2?.[0] ||
          data?.profile_image_3?.[0] ||
          data?.government_id?.[0] ||
          data?.postcode?.[0] ||
          data?.college_workplace?.[0] ||
          data?.role?.[0] ||
          data?.detail ||
          "Your profile could not be saved."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="app-page">
      <div className="app-heading">
        <div>
          <div className="eyebrow left">
            Profile and Preferences
          </div>

          <h1>
            {user?.full_name ||
              user?.first_name ||
              user?.email}
          </h1>

          <p>{user?.email}</p>
        </div>
      </div>

      <form
        className="app-panel profile-form"
        onSubmit={submit}
        encType="multipart/form-data"
      >
        <section className="profile-form-section">
          <h2>Personal Information</h2>

          <div className="form-row">
            <label>
              City
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleInputChange}
                placeholder="Bengaluru"
              />
            </label>

            <label>
              Locality
              <input
                type="text"
                name="locality"
                value={form.locality}
                onChange={handleInputChange}
                placeholder="Indiranagar"
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Postcode
              <input
                type="text"
                name="postcode"
                value={form.postcode}
                onChange={handleInputChange}
                placeholder="560038"
                maxLength={12}
              />
            </label>

            <label>
              College or Workplace
              <input
                type="text"
                name="college_workplace"
                value={form.college_workplace}
                onChange={handleInputChange}
                placeholder="Scaler or university name"
              />
            </label>
          </div>

          <label>
            Role
            <input
              type="text"
              name="role"
              value={form.role}
              onChange={handleInputChange}
              placeholder="Software Engineer, Student, Chef..."
            />
          </label>

          <label>
            Bio
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleInputChange}
              placeholder="Tell the FoodKindl community about yourself."
            />
          </label>
        </section>

        <section className="profile-form-section">
          <h2>Food Preferences</h2>

          <label>
            Dietary Preference
            <select
              name="dietary_preference"
              value={form.dietary_preference}
              onChange={handleInputChange}
            >
              <option value="none">No preference</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="halal">Halal</option>
              <option value="keto">Keto</option>
              <option value="pescatarian">
                Pescatarian
              </option>
              <option value="gluten_free">
                Gluten-free
              </option>
            </select>
          </label>

          <label>
            Food Interests
            <input
              type="text"
              name="interests"
              value={form.interests}
              onChange={handleInputChange}
              placeholder="Home cooking, baking, Italian food, Kerala cuisine..."
            />
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              name="women_only_mode"
              checked={form.women_only_mode}
              onChange={handleInputChange}
            />

            Enable women-only preference for applicable
            gatherings
          </label>
        </section>

        <section className="profile-form-section">
          <h2>Profile Photos</h2>

          <p className="upload-help">
            Upload up to three clear profile photos. JPG,
            PNG, and WebP files are supported.
          </p>

          <div className="profile-image-grid">
            <label className="profile-image-upload">
              <span>Profile Photo 1</span>

              {previews.profile_image_1 ? (
                <img
                  src={previews.profile_image_1}
                  alt="Profile preview 1"
                />
              ) : (
                <div className="image-placeholder">
                  No image selected
                </div>
              )}

              <input
                type="file"
                name="profile_image_1"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
              />
            </label>

            <label className="profile-image-upload">
              <span>Profile Photo 2</span>

              {previews.profile_image_2 ? (
                <img
                  src={previews.profile_image_2}
                  alt="Profile preview 2"
                />
              ) : (
                <div className="image-placeholder">
                  No image selected
                </div>
              )}

              <input
                type="file"
                name="profile_image_2"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
              />
            </label>

            <label className="profile-image-upload">
              <span>Profile Photo 3</span>

              {previews.profile_image_3 ? (
                <img
                  src={previews.profile_image_3}
                  alt="Profile preview 3"
                />
              ) : (
                <div className="image-placeholder">
                  No image selected
                </div>
              )}

              <input
                type="file"
                name="profile_image_3"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </section>

        <section className="profile-form-section">
          <h2>Identity Verification</h2>

          <p className="upload-help">
            Upload one government-issued identity document.
            The document should not be displayed publicly.
          </p>

          <label>
            Government ID Proof
            <input
              type="file"
              name="government_id"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={handleFileChange}
            />
          </label>

          {profile.government_id_uploaded && (
            <p className="existing-file-message">
              A government ID has already been uploaded.
            </p>
          )}
        </section>

        {error && (
          <p className="error-message">{error}</p>
        )}

        {message && (
          <p className="form-message">{message}</p>
        )}

        <button
          type="submit"
          className="primary-button"
          disabled={submitting}
        >
          {submitting
            ? "Saving Profile..."
            : "Save Profile"}
        </button>
      </form>
    </main>
  );
}