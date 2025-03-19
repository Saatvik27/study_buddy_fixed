// About.jsx
import Navbar from "./navbar.jsx";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gray-900 bg-opacity-50 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">About Us</h1>
          <p className="text-lg md:text-2xl">
            Learn more about our mission and the team behind our success.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl text-blue-800 font-bold text-center mb-8">Our Mission</h2>
          <p className="text-center text-gray-700 max-w-2xl mx-auto">
            At MyWebsite, our mission is to provide exceptional services that empower businesses to achieve their goals. We are committed to innovation, excellence, and fostering lasting relationships with our clients.
          </p>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Meet the Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Team Member 1 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
              <img
                src="https://source.unsplash.com/400x400/?person,1"
                alt="Team Member 1"
                className="w-full h-56 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Jane Doe</h3>
                <p className="text-gray-600 mb-4">CEO & Founder</p>
                <p className="text-gray-700">
                  Jane leads our team with over 10 years of experience in the industry, driving innovation and excellence in all our projects.
                </p>
              </div>
            </div>

            {/* Team Member 2 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
              <img
                src="https://source.unsplash.com/400x400/?person,2"
                alt="Team Member 2"
                className="w-full h-56 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">John Smith</h3>
                <p className="text-gray-600 mb-4">Lead Developer</p>
                <p className="text-gray-700">
                  John is the backbone of our technical team, specializing in building scalable and efficient solutions tailored to our clients' needs.
                </p>
              </div>
            </div>

            {/* Team Member 3 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
              <img
                src="https://source.unsplash.com/400x400/?person,3"
                alt="Team Member 3"
                className="w-full h-56 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Emily Johnson</h3>
                <p className="text-gray-600 mb-4">Marketing Manager</p>
                <p className="text-gray-700">
                  Emily drives our marketing strategies with creativity and data-driven insights, ensuring our brand reaches its full potential.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-gray-900 bg-opacity-50 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
          <p className="mb-8">
            Whether you have a question or just want to say hi, we'd love to hear from you!
          </p>
          <a
            href="/contact"
            className="bg-white text-blue-600 font-semibold py-3 px-6 rounded-md shadow-md hover:bg-gray-200 transition"
          >
            Contact Us
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} MyWebsite. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="/privacy" className="hover:underline">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:underline">
              Terms of Service
            </a>
            <a href="/contact" className="hover:underline">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;