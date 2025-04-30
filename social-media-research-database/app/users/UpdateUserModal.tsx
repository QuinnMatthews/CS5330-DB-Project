import { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import React from "react";

interface UpdateUserModalProps {
  show: boolean;
  onClose: () => void;
}

const UpdateUserModal: React.FC<UpdateUserModalProps> = ({ show, onClose }) => {
  useEffect(() => {
    // This is needed to load Bootstrap's JavaScript
    import("bootstrap/dist/js/bootstrap");
  }, []);
  
  if (!show) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    // convert the form data into a JSON object
    const data = JSON.stringify(Object.fromEntries(formData.entries()));


    try {
      let response = await fetch("/api/users", {
        method: "PATCH",
        body: data,
      });
      // Check if the response is ok
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Close the modal on successful submission
      onClose();
    } catch (error) {
      // Handle error
      console.error("Error submitting form:", error);
    }
  };
  
  
  // username, social_name, first_name, last_name, birthdate, gender, birth_country, residence_country

  return (
    <>
      <Modal show={show} onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title>Update User Data</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">
                Username:
              </label>
              <input
                type="text"
                className="form-control"
                id="username"
                name="username"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="social_name" className="form-label">
                Platform:
              </label>
              <input
                type="text"
                className="form-control"
                id="social_name"
                name="social_name"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="first_name" className="form-label">
                First name:
              </label>
              <input
                type="text"
                className="form-control"
                id="first_name"
                name="first_name"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="last_name" className="form-label">
                Last name:
              </label>
              <input
                type="text"
                className="form-control"
                id="last_name"
                name="last_name"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="birthdate" className="form-label">
                Birthdate:
              </label>
              <input
                type="text"
                className="form-control"
                id="birthdate"
                name="birthdate"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="gender" className="form-label">
                Gender:
              </label>
              <input
                type="text"
                className="form-control"
                id="gender"
                name="gender"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="birth_country" className="form-label">
                Birth country:
              </label>
              <input
                type="text"
                className="form-control"
                id="birth_country"
                name="birth_country"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="residence_country" className="form-label">
                Residence country:
              </label>
              <input
                type="text"
                className="form-control"
                id="residence_country"
                name="residence_country"
                required
              />
            </div>
            <Button variant="primary" type="submit">
              Submit
            </Button>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default UpdateUserModal;