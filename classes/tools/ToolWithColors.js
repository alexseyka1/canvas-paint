class ToolWithColors extends Tool {
  primaryColorInput
  secondaryColorInput

  primaryColor = "#ffffff"
  secondaryColor = "#000000"

  constructor(name, icon) {
    super(name, icon)
    this.setPrimaryColor = this.setPrimaryColor.bind(this)
    this.setSecondaryColor = this.setSecondaryColor.bind(this)

    this.#createColorInputs()
    this.registerEvent("input", this.setPrimaryColor, this.primaryColorInput)
  }

  setPrimaryColor(e) {
    this.primaryColor = e.target.value
    this.primaryColorInput.value = e.target.value
  }

  setSecondaryColor(e) {
    this.secondaryColor = e.target.value
    this.secondaryColorInput.value = e.target.value
  }

  #createColorInputs() {
    const primaryColorInput = document.createElement("input")
    primaryColorInput.type = "color"
    primaryColorInput.name = "primaryColor"
    primaryColorInput.value = this.primaryColor

    const secondaryColorInput = document.createElement("input")
    secondaryColorInput.type = "color"
    secondaryColorInput.name = "secondaryColor"
    secondaryColorInput.value = this.secondaryColor

    this.primaryColorInput = primaryColorInput
    this.secondaryColorInput = secondaryColorInput
  }

  onActivate() {
    super.onActivate()
    this.#initColorPickers()
  }

  onDeactivate() {
    super.onDeactivate()

    const colorsWrapper = document.querySelector(".bottomBar .colors")
    colorsWrapper.innerHTML = ""
  }

  #initColorPickers() {
    const colorsWrapper = document.querySelector(".bottomBar .colors")
    colorsWrapper.append(this.primaryColorInput)
    colorsWrapper.append(this.secondaryColorInput)
  }
}
