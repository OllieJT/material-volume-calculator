"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Calculator, AlertCircle, Info, Scale, Box } from "lucide-react"

interface DimensionInputs {
  length: string
  width: string
  height: string
}

interface VolumeInputs {
  volume: string
}

interface CalculationResult {
  containerVolume: number
  voidVolume: number
  materialVolume: number
  materialWeight: number
}

export default function VolumeCalculator() {
  const router = useRouter()
  const pathname = usePathname()

  const [containerDimensions, setContainerDimensions] = useState<DimensionInputs>({
    length: "",
    width: "",
    height: "",
  })

  const [voidDimensions, setVoidDimensions] = useState<DimensionInputs>({
    length: "",
    width: "",
    height: "",
  })

  const [containerVolumeInput, setContainerVolumeInput] = useState<VolumeInputs>({
    volume: "",
  })

  const [voidVolumeInput, setVoidVolumeInput] = useState<VolumeInputs>({
    volume: "",
  })

  const [containerInputType, setContainerInputType] = useState<"dimensions" | "volume">("dimensions")
  const [voidInputType, setVoidInputType] = useState<"dimensions" | "volume">("dimensions")
  const [materialDensity, setMaterialDensity] = useState<string>("")

  const [result, setResult] = useState<CalculationResult | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [warnings, setWarnings] = useState<string[]>([])

  // Load state from URL parameters on component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    // Load container data
    setContainerInputType((params.get("containerType") as "dimensions" | "volume") || "dimensions")
    setContainerDimensions({
      length: params.get("containerLength") || "",
      width: params.get("containerWidth") || "",
      height: params.get("containerHeight") || "",
    })
    setContainerVolumeInput({
      volume: params.get("containerVolume") || "",
    })

    // Load void data
    setVoidInputType((params.get("voidType") as "dimensions" | "volume") || "dimensions")
    setVoidDimensions({
      length: params.get("voidLength") || "",
      width: params.get("voidWidth") || "",
      height: params.get("voidHeight") || "",
    })
    setVoidVolumeInput({
      volume: params.get("voidVolume") || "",
    })

    // Load material density
    setMaterialDensity(params.get("density") || "")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update URL parameters when state changes
  const updateUrlParams = () => {
    const params = new URLSearchParams()

    // Container parameters
    params.set("containerType", containerInputType)
    if (containerInputType === "dimensions") {
      if (containerDimensions.length) params.set("containerLength", containerDimensions.length)
      if (containerDimensions.width) params.set("containerWidth", containerDimensions.width)
      if (containerDimensions.height) params.set("containerHeight", containerDimensions.height)
    } else {
      if (containerVolumeInput.volume) params.set("containerVolume", containerVolumeInput.volume)
    }

    // Void parameters
    params.set("voidType", voidInputType)
    if (voidInputType === "dimensions") {
      if (voidDimensions.length) params.set("voidLength", voidDimensions.length)
      if (voidDimensions.width) params.set("voidWidth", voidDimensions.width)
      if (voidDimensions.height) params.set("voidHeight", voidDimensions.height)
    } else {
      if (voidVolumeInput.volume) params.set("voidVolume", voidVolumeInput.volume)
    }

    // Material density
    if (materialDensity) params.set("density", materialDensity)

    // Update URL without page reload
    return params.toString()
  }

  const isFirstRender = useRef(true)

  // Update URL whenever relevant state changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    const timeoutId = setTimeout(() => {
      const paramsString = updateUrlParams() // returns the qs string (see change below)
      if (paramsString !== window.location.search.substring(1)) {
        router.replace(`${pathname}?${paramsString}`, { scroll: false })
      }
    }, 300) // Debounce URL updates

    return () => clearTimeout(timeoutId)
  }, [
    containerInputType,
    containerDimensions,
    containerVolumeInput,
    voidInputType,
    voidDimensions,
    voidVolumeInput,
    materialDensity,
  ])

  const validateNumber = (value: string, fieldName: string): number | null => {
    if (!value.trim()) {
      return null
    }

    const num = Number.parseFloat(value)
    if (isNaN(num)) {
      setErrors((prev) => [...prev, `${fieldName} must be a valid number`])
      return null
    }

    if (num < 0) {
      setErrors((prev) => [...prev, `${fieldName} cannot be negative`])
      return null
    }

    if (num === 0) {
      setWarnings((prev) => [...prev, `${fieldName} is zero`])
    }

    return num
  }

  const calculateVolume = (length: number, width: number, height: number): number => {
    return length * width * height
  }

  const handleCalculate = () => {
    setErrors([])
    setWarnings([])

    let containerVolume = 0
    let voidVolume = 0

    // Calculate container volume
    if (containerInputType === "dimensions") {
      const length = validateNumber(containerDimensions.length, "Container length")
      const width = validateNumber(containerDimensions.width, "Container width")
      const height = validateNumber(containerDimensions.height, "Container height")

      if (length === null || width === null || height === null) {
        return
      }

      if (!containerDimensions.length || !containerDimensions.width || !containerDimensions.height) {
        setErrors((prev) => [...prev, "All container dimensions are required"])
        return
      }

      containerVolume = calculateVolume(length, width, height)
    } else {
      const volume = validateNumber(containerVolumeInput.volume, "Container volume")
      if (volume === null) {
        return
      }

      if (!containerVolumeInput.volume) {
        setErrors((prev) => [...prev, "Container volume is required"])
        return
      }

      containerVolume = volume
    }

    // Calculate void volume (optional)
    if (voidInputType === "dimensions") {
      if (voidDimensions.length || voidDimensions.width || voidDimensions.height) {
        const length = validateNumber(voidDimensions.length, "Void length")
        const width = validateNumber(voidDimensions.width, "Void width")
        const height = validateNumber(voidDimensions.height, "Void height")

        if (length === null || width === null || height === null) {
          return
        }

        if (!voidDimensions.length || !voidDimensions.width || !voidDimensions.height) {
          setErrors((prev) => [...prev, "If specifying void dimensions, all fields are required"])
          return
        }

        voidVolume = calculateVolume(length, width, height)
      }
    } else {
      if (voidVolumeInput.volume) {
        const volume = validateNumber(voidVolumeInput.volume, "Void volume")
        if (volume === null) {
          return
        }
        voidVolume = volume
      }
    }

    // Check if void volume is larger than container volume
    if (voidVolume > containerVolume) {
      setErrors((prev) => [...prev, "Void volume cannot be larger than container volume"])
      return
    }

    const materialVolume = containerVolume - voidVolume

    // Calculate material weight if density is provided
    let materialWeight = 0
    if (materialDensity) {
      const density = validateNumber(materialDensity, "Material density")
      if (density === null) {
        return
      }
      // Convert mm³ to cm³ (divide by 1000) then multiply by density (g/cm³)
      materialWeight = (materialVolume / 1000) * density
    }

    setResult({
      containerVolume,
      voidVolume,
      materialVolume,
      materialWeight,
    })
  }

  const formatVolume = (volume: number): string => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(2)} cm³`
    }
    return `${volume.toFixed(2)} mm³`
  }

  const formatWeight = (weight: number): string => {
    if (weight >= 1000) {
      return `${(weight / 1000).toFixed(2)} kg`
    }
    return `${weight.toFixed(2)} g`
  }

  const reset = () => {
    setContainerDimensions({ length: "", width: "", height: "" })
    setVoidDimensions({ length: "", width: "", height: "" })
    setContainerVolumeInput({ volume: "" })
    setVoidVolumeInput({ volume: "" })
    setMaterialDensity("")
    setResult(null)
    setErrors([])
    setWarnings([])
    router.replace("/", { scroll: false })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <Calculator className="h-8 w-8 text-blue-600" />
            Material Volume Calculator
          </h1>
          <p className="text-gray-600">Calculate the volume and weight of material needed to fill a space</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Container Input */}
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-700 flex items-center gap-2">
                <Box className="h-5 w-5" />
                Container (Outer Object)
              </CardTitle>
              <CardDescription>Define the outer container that will hold the material</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="container-input-type">Input Method</Label>
                <Select
                  value={containerInputType}
                  onValueChange={(value) => setContainerInputType(value as "dimensions" | "volume")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose input method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dimensions">Enter Dimensions</SelectItem>
                    <SelectItem value="volume">Enter Volume Directly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {containerInputType === "dimensions" ? (
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="container-length">Length (mm)</Label>
                    <Input
                      id="container-length"
                      type="number"
                      placeholder="Enter length"
                      value={containerDimensions.length}
                      onChange={(e) => setContainerDimensions((prev) => ({ ...prev, length: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="container-width">Width (mm)</Label>
                    <Input
                      id="container-width"
                      type="number"
                      placeholder="Enter width"
                      value={containerDimensions.width}
                      onChange={(e) => setContainerDimensions((prev) => ({ ...prev, width: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="container-height">Height (mm)</Label>
                    <Input
                      id="container-height"
                      type="number"
                      placeholder="Enter height"
                      value={containerDimensions.height}
                      onChange={(e) => setContainerDimensions((prev) => ({ ...prev, height: e.target.value }))}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <Label htmlFor="container-volume">Volume (mm³)</Label>
                  <Input
                    id="container-volume"
                    type="number"
                    placeholder="Enter volume directly"
                    value={containerVolumeInput.volume}
                    onChange={(e) => setContainerVolumeInput({ volume: e.target.value })}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Void Input */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-700">Void Object (Optional)</CardTitle>
              <CardDescription>Define any internal void that displaces material</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="void-input-type">Input Method</Label>
                <Select
                  value={voidInputType}
                  onValueChange={(value) => setVoidInputType(value as "dimensions" | "volume")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose input method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dimensions">Enter Dimensions</SelectItem>
                    <SelectItem value="volume">Enter Volume Directly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {voidInputType === "dimensions" ? (
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="void-length">Length (mm)</Label>
                    <Input
                      id="void-length"
                      type="number"
                      placeholder="Enter length (optional)"
                      value={voidDimensions.length}
                      onChange={(e) => setVoidDimensions((prev) => ({ ...prev, length: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="void-width">Width (mm)</Label>
                    <Input
                      id="void-width"
                      type="number"
                      placeholder="Enter width (optional)"
                      value={voidDimensions.width}
                      onChange={(e) => setVoidDimensions((prev) => ({ ...prev, width: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="void-height">Height (mm)</Label>
                    <Input
                      id="void-height"
                      type="number"
                      placeholder="Enter height (optional)"
                      value={voidDimensions.height}
                      onChange={(e) => setVoidDimensions((prev) => ({ ...prev, height: e.target.value }))}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <Label htmlFor="void-volume">Volume (mm³)</Label>
                  <Input
                    id="void-volume"
                    type="number"
                    placeholder="Enter volume directly (optional)"
                    value={voidVolumeInput.volume}
                    onChange={(e) => setVoidVolumeInput({ volume: e.target.value })}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Material Density */}
        <Card>
          <CardHeader>
            <CardTitle className="text-purple-700 flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Material Properties
            </CardTitle>
            <CardDescription>Specify material density to calculate weight</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-md">
              <Label htmlFor="material-density">Material Density (g/cm³)</Label>
              <Input
                id="material-density"
                type="number"
                step="0.01"
                placeholder="e.g., 1.2 for silicone, 0.92 for polyethylene"
                value={materialDensity}
                onChange={(e) => setMaterialDensity(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Common densities: Silicone (1.2), Water (1.0), Aluminum (2.7), Steel (7.8)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={handleCalculate} size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Calculator className="mr-2 h-4 w-4" />
            Calculate Material Volume & Weight
          </Button>
          <Button onClick={reset} variant="outline" size="lg">
            Reset All Fields
          </Button>
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Warning Messages */}
        {warnings.length > 0 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {result && (
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">Calculation Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-100 rounded-lg">
                  <div className="text-2xl font-bold text-blue-800">{formatVolume(result.containerVolume)}</div>
                  <div className="text-sm text-blue-600">Container Volume</div>
                </div>

                <div className="text-center p-4 bg-red-100 rounded-lg">
                  <div className="text-2xl font-bold text-red-800">{formatVolume(result.voidVolume)}</div>
                  <div className="text-sm text-red-600">Void Volume</div>
                </div>

                <div className="text-center p-4 bg-green-100 rounded-lg">
                  <div className="text-2xl font-bold text-green-800">{formatVolume(result.materialVolume)}</div>
                  <div className="text-sm text-green-600">Material Volume</div>
                </div>

                {materialDensity && (
                  <div className="text-center p-4 bg-purple-100 rounded-lg">
                    <div className="text-2xl font-bold text-purple-800">{formatWeight(result.materialWeight)}</div>
                    <div className="text-sm text-purple-600">Material Weight</div>
                  </div>
                )}
              </div>

              <Separator />

              <div className="text-center space-y-2">
                <p className="text-lg font-semibold text-gray-800">
                  You will need <span className="text-green-700 font-bold">{formatVolume(result.materialVolume)}</span>{" "}
                  of material
                </p>
                {materialDensity && (
                  <p className="text-lg font-semibold text-gray-800">
                    That weighs approximately{" "}
                    <span className="text-purple-700 font-bold">{formatWeight(result.materialWeight)}</span>
                  </p>
                )}
                {result.materialVolume >= 1000000 && (
                  <p className="text-sm text-gray-600">
                    Volume: {(result.materialVolume / 1000000).toFixed(2)} cubic centimeters
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-gray-800">How to Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <p>
              1. <strong>Container:</strong> Choose input method and enter the dimensions or volume of the outer
              container.
            </p>
            <p>
              2. <strong>Void (Optional):</strong> If there's an object inside that displaces material, enter its
              dimensions or volume.
            </p>
            <p>
              3. <strong>Material Density (Optional):</strong> Enter the material's density in g/cm³ to calculate
              weight.
            </p>
            <p>
              4. <strong>Units:</strong> Dimensions in millimeters (mm), volumes in cubic millimeters (mm³), density in
              g/cm³.
            </p>
            <p>
              5. <strong>URL Persistence:</strong> Your inputs are saved in the URL - bookmark or share the link to
              preserve your calculation.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
