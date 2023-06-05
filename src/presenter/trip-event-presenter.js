import { render, replace, remove } from '../framework/render.js';
import AddEventForm from '../view/add-event-form.js';
import TripEvent from '../view/trips-event.js';
import { UserAction, UpdateType } from '../const-data.js';

const Mode = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING',
};

export default class TripEventPresenter {
  #eventComponent = null;
  #eventEditorComponent = null;

  #container = null;
  #changeData = null;
  #changeMode = null;

  #event = null;
  #mode = Mode.DEFAULT;

  constructor(container, changeData, changeMode) {
    this.#container = container;
    this.#changeData = changeData;
    this.#changeMode = changeMode;
  }

  init(event) {
    this.#event = event;

    const prevEventComponent = this.#eventComponent;
    const prevEventEditorComponent = this.#eventEditorComponent;

    this.#eventComponent = new TripEvent(event);
    this.#eventEditorComponent = new AddEventForm(event);

    this.#eventComponent.setArrowClickHandler(this.#replaceEventToForm);

    // нажатие на кнопку Save
    this.#eventEditorComponent.setFormSubmitListener(this.#replaceFormToEvent);
    // нажатие на стрелку, чтобы закрыть форму
    this.#eventEditorComponent.setCloseButtonClickListener(this.#replaceFormToEvent);
    this.#eventEditorComponent.setDeleteButtonClickListener(this.#handleDeleteClick);

    if (prevEventComponent === null || prevEventEditorComponent === null) {
      render(this.#eventComponent, this.#container.element);
      return 0;
    }

    if (this.#mode === Mode.DEFAULT) {
      replace(this.#eventComponent, prevEventComponent);
    }

    if (this.#mode === Mode.EDITING) {
      replace(this.#eventEditorComponent, prevEventEditorComponent);
    }

    remove(prevEventComponent);
    remove(prevEventEditorComponent);
  }

  #replaceFormToEvent = () => {
    this.#eventEditorComponent.reset(this.#event);
    this.#eventEditorComponent.removeEscKeydownListener();
    this.#mode = Mode.DEFAULT;
    replace(this.#eventComponent, this.#eventEditorComponent);
  };

  #replaceEventToForm = () => {
    this.#eventEditorComponent.setEscKeydownListener(this.#replaceFormToEvent);
    this.#changeMode();
    this.#mode = Mode.EDITING;

    replace(this.#eventEditorComponent, this.#eventComponent);
  };

  #handleFormSubmit = (tripEvent) => {
    this.#replaceFormToEvent();
    this.#changeData(tripEvent);
  };

  destroy = () => {
    remove(this.#eventEditorComponent);
    remove(this.#eventComponent);
  };

  resetView = () => {
    if (this.#mode !== Mode.DEFAULT) {
      this.#eventEditorComponent.reset(this.#event);
      this.#replaceFormToEvent();
    }
  };

  #removeElement = () => {
    this.#eventEditorComponent.removeEscKeydownListener();
    this.destroy();
  };

  #handleDeleteClick = (point) => {
    this.#eventEditorComponent.removeEscKeydownListener();
    this.#changeData();
  };
}
