import { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import React from "react";

interface AddSocialModalProps {
  show: boolean;
  onClose: () => void;
}

const AddSocialModal: React.FC<AddSocialModalProps> = ({ show, onClose }) => {
  if (!show) {
    return null;
  }

  useEffect(() => {
    // This is needed to load Bootstrap's JavaScript
    import("bootstrap/dist/js/bootstrap");
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    // convert the form data into a JSON object
    const data = JSON.stringify(Object.fromEntries(formData.entries()));


    try {
      let response = await fetch("/api/socials", {
        method: "POST",
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

  return (
    <>
      <Modal show={show} onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add Social Media</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Name:
              </label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
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

export default AddSocialModal;