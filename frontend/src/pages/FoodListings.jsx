import { useEffect, useState } from "react";
import {
  AlarmClock,
  CalendarClock,
  Hourglass,
  UsersRound,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import api from "../api";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  title: "",
  description: "",
  quantity: "",
  quantity_kg: "",
  location: "",
  pickup_datetime: null,
};

export default function FoodListings() {
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [workingId, setWorkingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  async function loadListings() {
    setError("");

    try {
      const response = await api.get("/food-listings/");
      const listingData = response.data?.results || response.data;

      setItems(Array.isArray(listingData) ? listingData : []);
    } catch (requestError) {
      console.error(
        "Unable to load food listings:",
        requestError.response?.status,
        requestError.response?.data || requestError
      );

      setError(
        requestError.response?.data?.detail ||
          "Food listings could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadListings();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => window.clearInterval(timer);
  }, []);

  function updateForm(field, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function getTimeRemaining(pickupTime) {
    if (!pickupTime) {
      return {
        text: "Pickup time unavailable",
        expired: true,
      };
    }

    const pickupDate = new Date(pickupTime);

    if (Number.isNaN(pickupDate.getTime())) {
      return {
        text: "Invalid pickup time",
        expired: true,
      };
    }

    const difference = pickupDate.getTime() - currentTime.getTime();

    if (difference <= 0) {
      return {
        text: "Pickup time has passed",
        expired: true,
      };
    }

    const totalMinutes = Math.max(
      1,
      Math.ceil(difference / (1000 * 60))
    );

    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;

    if (days > 0) {
      return {
        text: `${days}d ${hours}h remaining`,
        expired: false,
      };
    }

    if (hours > 0) {
      return {
        text: `${hours}h ${minutes}m remaining`,
        expired: false,
      };
    }

    return {
      text: `${minutes}m remaining`,
      expired: false,
    };
  }

  function getErrorMessage(data) {
    if (!data) {
      return "The request could not be completed.";
    }

    if (typeof data === "string") {
      return data;
    }

    return (
      data?.title?.[0] ||
      data?.description?.[0] ||
      data?.quantity?.[0] ||
      data?.quantity_kg?.[0] ||
      data?.location?.[0] ||
      data?.pickup_time?.[0] ||
      data?.non_field_errors?.[0] ||
      data?.detail ||
      "The request could not be completed."
    );
  }

  function getOwnerName(owner) {
    return (
      owner?.full_name ||
      [owner?.first_name, owner?.last_name].filter(Boolean).join(" ") ||
      owner?.email ||
      "FoodKindl Member"
    );
  }

  async function createListing(event) {
    event.preventDefault();

    setPublishing(true);
    setMessage("");
    setError("");

    try {
      const quantityWeight = Number(form.quantity_kg);

      if (Number.isNaN(quantityWeight) || quantityWeight <= 0) {
        setError("Weight must be greater than zero.");
        return;
      }

      if (!(form.pickup_datetime instanceof Date)) {
        setError("Please select a pickup date and time.");
        return;
      }

      if (Number.isNaN(form.pickup_datetime.getTime())) {
        setError("The selected pickup date and time is invalid.");
        return;
      }

      if (form.pickup_datetime <= new Date()) {
        setError("Please select a future pickup date and time.");
        return;
      }

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        quantity: form.quantity.trim(),
        quantity_kg: quantityWeight,
        location: form.location.trim(),
        pickup_time: form.pickup_datetime.toISOString(),
      };

      const response = await api.post("/food-listings/", payload);

      const listing = response.data?.listing || response.data;
      const conversation = response.data?.group_conversation || null;

      setForm(emptyForm);
      setMessage(
        conversation
          ? "Food listing published and group chat created."
          : "Food listing published successfully."
      );

      await loadListings();

      if (conversation?.id) {
        window.dispatchEvent(
          new CustomEvent("foodkindl:open-group-chat", {
            detail: {
              listing,
              conversation,
            },
          })
        );
      }
    } catch (requestError) {
      console.error(
        "Publish listing error:",
        requestError.response?.status,
        requestError.response?.data || requestError
      );

      setError(getErrorMessage(requestError.response?.data));
    } finally {
      setPublishing(false);
    }
  }

  async function claimListing(item) {
    setWorkingId(item.id);
    setMessage("");
    setError("");

    try {
      await api.post(`/food-listings/${item.id}/claim/`);
      setMessage("The food listing has been reserved for you.");
      await loadListings();
    } catch (requestError) {
      console.error(
        "Claim listing error:",
        requestError.response?.data || requestError
      );

      setError(getErrorMessage(requestError.response?.data));
    } finally {
      setWorkingId(null);
    }
  }

  async function markCollected(item) {
    const confirmed = window.confirm(
      "Confirm that this food has been collected?"
    );

    if (!confirmed) {
      return;
    }

    setWorkingId(item.id);
    setMessage("");
    setError("");

    try {
      await api.post(`/food-listings/${item.id}/mark-collected/`);
      setMessage("The food has been marked as collected.");

      window.dispatchEvent(
        new CustomEvent("foodkindl:close-food-group-chat", {
          detail: {
            listingId: item.id,
          },
        })
      );

      await loadListings();
    } catch (requestError) {
      console.error(
        "Mark collected error:",
        requestError.response?.status,
        requestError.response?.data || requestError
      );

      setError(getErrorMessage(requestError.response?.data));
    } finally {
      setWorkingId(null);
    }
  }

  async function openGroupChat(item) {
    setMessage("");
    setError("");

    if (item.status === "collected") {
      setError(
        "This group chat has expired because the food was collected."
      );
      return;
    }

    try {
      const response = await api.post(
        `/food-listings/${item.id}/group-chat/`
      );

      window.dispatchEvent(
        new CustomEvent("foodkindl:open-group-chat", {
          detail: {
            listing: item,
            conversation: response.data,
          },
        })
      );
    } catch (requestError) {
      console.error(
        "Open group chat error:",
        requestError.response?.status,
        requestError.response?.data || requestError
      );

      setError(getErrorMessage(requestError.response?.data));
    }
  }

  if (loading) {
    return (
      <main className="app-page">
        <div className="app-panel">Loading food listings...</div>
      </main>
    );
  }

  return (
    <main className="app-page">
      <div className="app-heading">
        <div>
          <div className="eyebrow left">Food service</div>
          <h1>Surplus food sharing</h1>
          <p>
            Publish safe surplus food, reserve available meals and coordinate
            pickup through a temporary group chat.
          </p>
        </div>
      </div>

      {user && (
        <form className="app-panel form-grid" onSubmit={createListing}>
          <label>
            Food title
            <input
              type="text"
              placeholder="Vegetable biryani"
              value={form.title}
              onChange={(event) => updateForm("title", event.target.value)}
              required
            />
          </label>

          <label>
            Quantity
            <input
              type="text"
              placeholder="5 meal boxes"
              value={form.quantity}
              onChange={(event) => updateForm("quantity", event.target.value)}
              required
            />
          </label>

          <label>
            Approximate weight in kilograms
            <input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="2.5"
              value={form.quantity_kg}
              onChange={(event) =>
                updateForm("quantity_kg", event.target.value)
              }
              required
            />
          </label>

          <label>
            Pickup location
            <input
              type="text"
              placeholder="Indiranagar, Bengaluru"
              value={form.location}
              onChange={(event) => updateForm("location", event.target.value)}
              required
            />
          </label>

          <label className="span-two">
            Pickup date and time
            <div className="foodkindl-datepicker-wrapper">
              <CalendarClock
                size={22}
                strokeWidth={2.2}
                className="foodkindl-datepicker-icon"
              />

              <DatePicker
                selected={form.pickup_datetime}
                onChange={(date) => updateForm("pickup_datetime", date)}
                showTimeSelect
                timeIntervals={15}
                minDate={new Date()}
                minTime={
                  form.pickup_datetime &&
                  form.pickup_datetime.toDateString() ===
                    new Date().toDateString()
                    ? new Date()
                    : new Date(0, 0, 0, 0, 0)
                }
                maxTime={new Date(0, 0, 0, 23, 45)}
                dateFormat="dd MMMM yyyy, h:mm aa"
                placeholderText="Choose pickup date and time"
                className="foodkindl-datepicker-input"
                calendarClassName="foodkindl-calendar"
                wrapperClassName="foodkindl-datepicker-control"
                popperPlacement="bottom-start"
                showPopperArrow={false}
                required
              />
            </div>
          </label>

          <label className="span-two">
            Food description
            <textarea
              placeholder="Describe the food, allergens, packaging, freshness and pickup instructions."
              value={form.description}
              onChange={(event) =>
                updateForm("description", event.target.value)
              }
              required
            />
          </label>

          {error && <p className="error-message span-two">{error}</p>}
          {message && <p className="form-message span-two">{message}</p>}

          <button
            type="submit"
            className="primary-button"
            disabled={publishing}
          >
            {publishing ? "Publishing..." : "Publish Listing"}
          </button>
        </form>
      )}

      <section className="listing-grid">
        {items.length === 0 ? (
          <div className="app-panel">No food listings have been published.</div>
        ) : (
          items.map((item) => {
            const isOwner = item.owner?.id === user?.id;
            const isReservedByUser = item.claimed_by?.id === user?.id;
            const isWorking = workingId === item.id;
            const pickupDate = new Date(item.pickup_time);
            const validPickupDate = !Number.isNaN(pickupDate.getTime());
            const timeRemaining = getTimeRemaining(item.pickup_time);

            const canOpenChat =
              user &&
              item.status !== "collected" &&
              (isOwner || isReservedByUser || item.is_group_member);

            return (
              <article className="listing-card" key={item.id}>
                <div className="listing-top">
                  <span className={`status-badge ${item.status}`}>
                    {item.status}
                  </span>
                </div>

                <h2>{item.title}</h2>
                <p>{item.description}</p>

                <div className="food-posting-schedule">
                  <div className="food-schedule-card pickup-date-card">
                    <CalendarClock size={30} strokeWidth={2.2} />
                    <div>
                      <small>Pickup date</small>
                      <strong>
                        {validPickupDate
                          ? pickupDate.toLocaleDateString(undefined, {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Unavailable"}
                      </strong>
                    </div>
                  </div>

                  <div className="food-schedule-card pickup-time-card">
                    <AlarmClock size={30} strokeWidth={2.2} />
                    <div>
                      <small>Pickup time</small>
                      <strong>
                        {validPickupDate
                          ? pickupDate.toLocaleTimeString(undefined, {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Unavailable"}
                      </strong>
                    </div>
                  </div>

                  <div
                    className={
                      timeRemaining.expired
                        ? "food-schedule-card countdown-card expired"
                        : "food-schedule-card countdown-card"
                    }
                  >
                    <Hourglass size={30} strokeWidth={2.2} />
                    <div>
                      <small>Time remaining</small>
                      <strong>
                        {item.status === "collected"
                          ? "Food collected"
                          : timeRemaining.text}
                      </strong>
                    </div>
                  </div>
                </div>

                <dl>
                  <div>
                    <dt>Quantity</dt>
                    <dd>{item.quantity}</dd>
                  </div>

                  <div>
                    <dt>Weight</dt>
                    <dd>{item.quantity_kg} kg</dd>
                  </div>

                  <div>
                    <dt>Location</dt>
                    <dd>{item.location}</dd>
                  </div>

                  <div>
                    <dt>Shared by</dt>
                    <dd>{getOwnerName(item.owner)}</dd>
                  </div>

                  {item.claimed_by && (
                    <div>
                      <dt>Reserved by</dt>
                      <dd>{getOwnerName(item.claimed_by)}</dd>
                    </div>
                  )}
                </dl>

                <div className="food-listing-actions">
                  {user &&
                    item.status === "available" &&
                    !isOwner &&
                    !timeRemaining.expired && (
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() => claimListing(item)}
                        disabled={isWorking}
                      >
                        {isWorking ? "Reserving..." : "Reserve Food"}
                      </button>
                    )}

                  {canOpenChat && (
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => openGroupChat(item)}
                    >
                      <UsersRound size={18} />
                      Group Chat
                    </button>
                  )}

                  {user && isOwner && item.status === "reserved" && (
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => markCollected(item)}
                      disabled={isWorking}
                    >
                      {isWorking ? "Updating..." : "Mark as Collected"}
                    </button>
                  )}

                  {timeRemaining.expired && item.status !== "collected" && (
                    <span className="status-badge expired">Pickup expired</span>
                  )}

                  {item.status === "collected" && (
                    <span className="status-badge collected">Collected</span>
                  )}
                </div>
              </article>
            );
          })
        )}
      </section>
    </main>
  );
}