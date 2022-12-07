import React, { useContext } from "react";

import {
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
} from "../../shared/util/validators";
import Input from "../../shared/components/FormElements/Input";
import "./PlaceForm.css";
import Button from "../../shared/components/FormElements/Button";
import { useForm } from "../../shared/hooks/form-hook";
import { useHttpClient } from "../../shared/hooks/http-hook";
import { AuthContext } from "../../shared/context/auth-context";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import { useHistory } from "react-router-dom";
import ImageUpload from "../../shared/components/FormElements/ImageUpload";

const NewPlace = () => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [formState, InputHandler] = useForm(
    {
      title: {
        value: "",
        isValid: false,
      },
      description: {
        value: "",
        isValid: false,
      },
      address: {
        value: "",
        isValid: false,
      },
      image: {
        value: null,
        isValid: false,
      },
    },
    false
  );
  const history = useHistory();
  const auth = useContext(AuthContext);
  const placeSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", formState.inputs.title.value);
      formData.append("description", formState.inputs.description.value);
      formData.append("address", formState.inputs.address.value);
      formData.append("creator", auth.userId);
      formData.append("image", formState.inputs.image.value);

      await sendRequest("http://localhost:3000/api/places", "POST", formData);
      history.push("/");
    } catch (err) {}
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <form className="place-form" onSubmit={placeSubmitHandler}>
        {isLoading && <LoadingSpinner asOverlay />}
        <Input
          id="title"
          element="input"
          type="text"
          label="Title"
          errorText="Please enter a valid title."
          validators={[VALIDATOR_REQUIRE()]}
          onInput={InputHandler}
        />
        <Input
          id="description"
          element="textarea"
          label="Description"
          errorText="Please enter a valid description (at least 5 characters)."
          validators={[VALIDATOR_MINLENGTH(5)]}
          onInput={InputHandler}
        />
        <Input
          id="address"
          element="input"
          label="Address"
          errorText="Please enter a valid address."
          validators={[VALIDATOR_REQUIRE()]}
          onInput={InputHandler}
        />
        <ImageUpload
          center
          id="image"
          onInput={InputHandler}
          errorText="Please provide an image"
        />
        <Button type="submit" disabled={!formState.isValid}>
          Add Place
        </Button>
      </form>
    </React.Fragment>
  );
};

export default NewPlace;
