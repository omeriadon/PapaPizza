import React from "react";
import "./SubmitCartButton.css";

const SubmitCartButton: React.FC = () => {
  const handleSubmit = async () => {
    try {
      const response = await fetch(
        "http://localhost:1984/api/current-order/commit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        alert(`Order submitted successfully! Order ID: ${data.order_id}`);

        await fetch("http://localhost:1984/api/current-order", {
          method: "DELETE",
        });
      } else {
        const errorData = await response.json();
        alert(`Failed to submit order: ${errorData.error}`);
      }
    } catch (error) {
      alert(`An error occurred: ${error}`);
    }
    window.location.reload();
  };

  return (
    <button onClick={handleSubmit} className="button">
      Submit Cart
    </button>
  );
};

export default SubmitCartButton;
