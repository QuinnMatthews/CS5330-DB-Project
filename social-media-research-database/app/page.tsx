"use client"
import Image from "next/image";
import styles from "./page.module.css";

import { useEffect, useState } from 'react';

import AddSocialModal from './AddSocialModal';


export default function Home() {
  const [socialData, setSocialData] = useState<any[]>([]);
  const [socialsLoading, setSocialsLoading] = useState(true);
  
  const [userData, setUserData] = useState<any[]>([]);
  const [userLoading, setUserLoading] = useState(true);
  
  const [showAddSocialModal, setShowAddSocialModal] = useState(false);

  const openAddSocialModal = () => setShowAddSocialModal(true);
  const closeAddSocialModal = () => {
    setShowAddSocialModal(false);
    // Trigger a re-fetch
    fetchSocials();
  };

  // Fetch functions
  const fetchSocials = () => {
    fetch('/api/socials')
      .then((response) => response.json())
      .then((data) => {
        setSocialData(data);
        setSocialsLoading(false);
      });
  };

  const fetchUsers = () => {
    fetch('/api/users')
      .then((response) => response.json())
      .then((data) => {
        setUserData(data);
        setUserLoading(false);
      });
  };

  // Run once on mount
  useEffect(() => {
    fetchSocials();
    fetchUsers();
  }, []);

  return (
    <div>
      {/* navbar */}
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            Navbar
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a className="nav-link active" aria-current="page" href="#">
                  Home
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link active" aria-current="page" href="#">
                  Contact-us
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link active" aria-current="page" href="#">
                  About Us
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  Link
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <h2 className="text-center text-bg-primary m-2 p-2">
        Social Media Research Database
      </h2>
      <div className="container-fluid m-2 border border-success text-center">
        <h4>Social Media Platforms</h4>{" "}
        <table className="table table-striped">
          <thead>
            <tr>
              <th scope="col">Platform</th>
            </tr>
          </thead>
          <tbody>
            {socialsLoading? (
              <tr>
                <td> Loading...</td>
              </tr>
            ) : (
              socialData.map((social: any) => (
                <tr key={social.name}>
                  <td >{social.name}</td>
                </tr>
              ))
            )}
          </tbody>
          </table>
          <button className="btn btn-primary m-2" onClick={openAddSocialModal}>Add</button>
      </div>
      <div className="container-fluid m-2 border border-success text-center">
        <h4>User Data</h4>{" "}
        <table className="table table-striped">
          <thead>
            <tr>
              <th scope="col">Username</th>
              <th scope="col">Social Platform</th>
              <th scope="col">First Name</th>
              <th scope="col">Last Name</th>
              <th scope="col">Gender</th>
            </tr>
          </thead>
          {userLoading ? (
            <tr>
              <td>Loading...</td>
            </tr>
          ) : (
            userData.map((user: any) => (
              <tr key={user.social_name + "." + user.username}>
                <td>{user.username}</td>
                <td>{user.social_name}</td>
                <td>{user.first_name}</td>
                <td>{user.last_name}</td>
                <td>{user.gender}</td>
              </tr>
            ))
          )}
        </table>
      </div>
      <AddSocialModal show={showAddSocialModal} onClose={closeAddSocialModal} />
    </div>
  );
}
