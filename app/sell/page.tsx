"use client"

import type React from "react"
import { useState, useRef, useEffect, useMemo } from "react"
import { Upload, X, Plus, DollarSign, Car, Camera, FileText, Check, AlertCircle, MapPin } from "lucide-react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"

// First, import the vehicle database at the top of the file, after the other imports
import { vehicleDatabase } from "@/lib/vehicle-database"

// Vehicle categories data
const vehicleCategories = [
  { value: "cars-trucks", label: "Cars & Trucks", icon: "🚗" },
  { value: "motorcycles", label: "Motorcycles", icon: "🏍️" },
  { value: "rvs", label: "RVs & Campers", icon: "🚐" },
  { value: "boats", label: "Boats & Watercraft", icon: "⛵" },
  { value: "offroad", label: "Off-Road Vehicles", icon: "🏁" },
]

// Vehicle data by category
const vehicleData = {
  "cars-trucks": {
    makes: [
      "Acura",
      "Alfa Romeo",
      "AM General",
      "Aston Martin",
      "Audi",
      "Bentley",
      "BMW",
      "Buick",
      "Cadillac",
      "Chevrolet",
      "Chrysler",
      "Daewoo",
      "Daihatsu",
      "Dodge",
      "Eagle",
      "Ferrari",
      "Fiat",
      "Ford",
      "Genesis",
      "Geo",
      "GMC",
      "Honda",
      "Hummer",
      "Hyundai",
      "Infiniti",
      "Isuzu",
      "Jaguar",
      "Jeep",
      "Kia",
      "Lamborghini",
      "Land Rover",
      "Lexus",
      "Lincoln",
      "Lotus",
      "Maserati",
      "Maybach",
      "Mazda",
      "McLaren",
      "Mercedes-Benz",
      "Mercury",
      "Mini",
      "Mitsubishi",
      "Nissan",
      "Oldsmobile",
      "Peugeot",
      "Plymouth",
      "Pontiac",
      "Porsche",
      "Ram",
      "Rolls-Royce",
      "Saab",
      "Saturn",
      "Scion",
      "Smart",
      "Subaru",
      "Suzuki",
      "Tesla",
      "Toyota",
      "Volkswagen",
      "Volvo",
    ],
    bodyTypes: ["Sedan", "SUV", "Hatchback", "Coupe", "Convertible", "Pickup Truck", "Wagon", "Minivan", "Crossover"],
    fuelTypes: ["Gasoline", "Diesel", "Electric", "Hybrid", "Plug-in Hybrid"],
  },
  motorcycles: {
    makes: [
      "Aprilia",
      "Arctic Cat",
      "Benelli",
      "Beta",
      "BMW",
      "Bultaco",
      "Can-Am",
      "CFMoto",
      "Ducati",
      "Gas Gas",
      "Harley-Davidson",
      "Honda",
      "Husaberg",
      "Husqvarna",
      "Hyosung",
      "Indian",
      "Kawasaki",
      "KTM",
      "Kymco",
      "Moto Guzzi",
      "MV Agusta",
      "Norton",
      "Piaggio",
      "Polaris",
      "Royal Enfield",
      "Suzuki",
      "SYM",
      "Triumph",
      "Victory",
      "Yamaha",
      "Zero",
    ],
    bodyTypes: [
      "Cruiser",
      "Sport",
      "Touring",
      "Standard",
      "Dual Sport",
      "Dirt Bike",
      "Scooter",
      "Chopper",
      "Cafe Racer",
      "Adventure",
      "Supermoto",
      "Electric",
    ],
    fuelTypes: ["Gasoline", "Electric"],
  },
  rvs: {
    makes: [
      "Airstream",
      "American Coach",
      "Beaver",
      "Bigfoot",
      "Blue Bird",
      "Bounder",
      "Coachmen",
      "Country Coach",
      "Crossroads",
      "Damon",
      "Dutchmen",
      "Fleetwood",
      "Forest River",
      "Four Winds",
      "Georgie Boy",
      "Grand Design",
      "Gulf Stream",
      "Heartland",
      "Holiday Rambler",
      "Itasca",
      "Jayco",
      "Keystone",
      "Lance",
      "Lazy Daze",
      "Monaco",
      "National",
      "Newmar",
      "Northwood",
      "Pace Arrow",
      "Prime Time",
      "Roadtrek",
      "Safari",
      "Shasta",
      "Thor",
      "Tiffin",
      "Travel Lite",
      "Winnebago",
    ],
    bodyTypes: [
      "Class A",
      "Class B",
      "Class C",
      "Travel Trailer",
      "Fifth Wheel",
      "Toy Hauler",
      "Pop-up Camper",
      "Truck Camper",
      "Park Model",
      "Motorhome",
    ],
    fuelTypes: ["Gasoline", "Diesel"],
  },
  boats: {
    makes: [
      "Albemarle",
      "Alumacraft",
      "Aquasport",
      "Baja",
      "Bass Cat",
      "Bass Tracker",
      "Bayliner",
      "Bertram",
      "Boston Whaler",
      "Chaparral",
      "Chris-Craft",
      "Cobalt",
      "Crestliner",
      "Donzi",
      "Formula",
      "Four Winns",
      "Glastron",
      "Grady-White",
      "Hatteras",
      "Hunter",
      "Larson",
      "Lowe",
      "Lund",
      "Malibu",
      "MasterCraft",
      "Maxum",
      "Monterey",
      "Nitro",
      "Pearson",
      "Princecraft",
      "Ranger",
      "Regal",
      "Rinker",
      "Robalo",
      "Sea Doo",
      "Sea Fox",
      "Sea Ray",
      "Skeeter",
      "Stingray",
      "Stratos",
      "Sunbird",
      "Tracker",
      "Triton",
      "Wellcraft",
      "Yamaha",
    ],
    bodyTypes: [
      "Bowrider",
      "Pontoon",
      "Bass Boat",
      "Ski Boat",
      "Fishing Boat",
      "Sailboat",
      "Yacht",
      "Jet Ski",
      "Cabin Cruiser",
      "Center Console",
      "Deck Boat",
      "Runabout",
      "Catamaran",
      "Trawler",
      "Sportfisher",
    ],
    fuelTypes: ["Gasoline", "Diesel", "Electric", "Outboard"],
  },
  offroad: {
    makes: [
      "Arctic Cat",
      "Beta",
      "BRP",
      "Can-Am",
      "CFMoto",
      "Gas Gas",
      "Honda",
      "Husaberg",
      "Husqvarna",
      "Kawasaki",
      "KTM",
      "Kymco",
      "Polaris",
      "Sherco",
      "Suzuki",
      "TM Racing",
      "Yamaha",
      "Zero",
    ],
    bodyTypes: [
      "ATV",
      "Side-by-Side (UTV)",
      "Dirt Bike",
      "Dune Buggy",
      "Go-Kart",
      "Sand Rail",
      "Quad",
      "Three Wheeler",
    ],
    fuelTypes: ["Gasoline", "Electric"],
  },
}

const transmissionTypes = ["Automatic", "Manual", "CVT"]

const conditions = [
  { value: "excellent", label: "Excellent", description: "Like new, no visible wear" },
  { value: "very-good", label: "Very Good", description: "Minor wear, well maintained" },
  { value: "good", label: "Good", description: "Normal wear, good condition" },
  { value: "fair", label: "Fair", description: "Some wear, needs minor work" },
  { value: "poor", label: "Poor", description: "Significant wear, needs major work" },
]

const features = {
  "cars-trucks": [
    "Air Conditioning",
    "Heated Seats",
    "Leather Seats",
    "Sunroof",
    "Navigation System",
    "Backup Camera",
    "Bluetooth",
    "Cruise Control",
    "Keyless Entry",
    "Remote Start",
    "Premium Sound",
    "Third Row Seating",
    "All-Wheel Drive",
    "Towing Package",
    "Sport Package",
    "Cold Weather Package",
  ],
  motorcycles: [
    "ABS Brakes",
    "Traction Control",
    "Heated Grips",
    "Windshield",
    "Saddlebags",
    "Top Box",
    "Custom Exhaust",
    "LED Lighting",
    "Quick Shifter",
    "Cruise Control",
    "GPS Mount",
    "Phone Charger",
  ],
  rvs: [
    "Generator",
    "Solar Panels",
    "Slide Outs",
    "Awning",
    "Air Conditioning",
    "Microwave",
    "Refrigerator",
    "TV/Entertainment",
    "Washer/Dryer",
    "Fireplace",
    "Outdoor Kitchen",
    "Satellite TV",
    "WiFi Booster",
  ],
  boats: [
    "GPS/Fish Finder",
    "Stereo System",
    "Bimini Top",
    "Trailer Included",
    "Outboard Motor",
    "Trolling Motor",
    "Live Well",
    "Rod Holders",
    "Swim Platform",
    "Anchor",
    "Safety Equipment",
    "Covers",
  ],
  offroad: [
    "Winch",
    "LED Light Bar",
    "Roof",
    "Windshield",
    "Doors",
    "Cargo Box",
    "Brush Guards",
    "Skid Plates",
    "Upgraded Suspension",
    "Custom Wheels",
    "Sound System",
    "GPS Mount",
  ],
}

const exteriorColors = [
  "Black",
  "White",
  "Silver",
  "Gray",
  "Red",
  "Blue",
  "Green",
  "Brown",
  "Gold",
  "Beige",
  "Yellow",
  "Orange",
  "Purple",
  "Maroon",
  "Other",
]

const interiorColors = ["Black", "Gray", "Tan", "Beige", "Brown", "White", "Red", "Blue", "Green", "Other"]

// Helper function to safely parse numbers
const safeParseInt = (value: string): number => {
  const parsed = Number.parseInt(value, 10)
  return !isNaN(parsed) && isFinite(parsed) ? parsed : 0
}

// Helper function to safely get string values
const safeString = (value: string): string => {
  return value && typeof value === "string" ? value.trim() : ""
}

// Photo upload configuration
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_PHOTOS = 20
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

// Function to validate file
const validateFile = (file: File): string | null => {
  if (file.size > MAX_FILE_SIZE) {
    return `File size exceeds the maximum allowed (${MAX_FILE_SIZE / 1024 / 1024}MB).`
  }
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return `File type not supported. Please upload one of the following types: ${ACCEPTED_IMAGE_TYPES.join(", ")}.`
  }
  return null
}

// Helper function to get cities for a state
const getCitiesForState = (state: string): string[] => {
  const citiesByState: { [key: string]: string[] } = {
    Alabama: [
      "Birmingham",
      "Montgomery",
      "Mobile",
      "Huntsville",
      "Tuscaloosa",
      "Auburn",
      "Dothan",
      "Decatur",
      "Madison",
      "Florence",
      "Hoover",
      "Vestavia Hills",
      "Prattville",
      "Gadsden",
      "Alabaster",
      "Opelika",
      "Enterprise",
      "Bessemer",
      "Homewood",
      "Athens",
      "Daphne",
      "Pelham",
      "Oxford",
      "Phenix City",
      "Mountain Brook",
    ],
    Alaska: [
      "Anchorage",
      "Fairbanks",
      "Juneau",
      "Sitka",
      "Ketchikan",
      "Wasilla",
      "Kenai",
      "Kodiak",
      "Bethel",
      "Palmer",
      "Homer",
      "Unalaska",
      "Barrow",
      "Soldotna",
      "Valdez",
      "Nome",
      "Kotzebue",
      "Seward",
      "Wrangell",
      "North Pole",
    ],
    Arizona: [
      "Phoenix",
      "Tucson",
      "Mesa",
      "Chandler",
      "Scottsdale",
      "Glendale",
      "Gilbert",
      "Tempe",
      "Peoria",
      "Surprise",
      "Yuma",
      "Avondale",
      "Goodyear",
      "Flagstaff",
      "Buckeye",
      "Casa Grande",
      "Lake Havasu City",
      "Prescott",
      "Maricopa",
      "Bullhead City",
      "Prescott Valley",
      "Apache Junction",
      "Queen Creek",
      "Sierra Vista",
      "Oro Valley",
    ],
    Arkansas: [
      "Little Rock",
      "Fort Smith",
      "Fayetteville",
      "Springdale",
      "Jonesboro",
      "North Little Rock",
      "Conway",
      "Rogers",
      "Pine Bluff",
      "Bentonville",
      "Hot Springs",
      "Benton",
      "Texarkana",
      "Sherwood",
      "Jacksonville",
      "Russellville",
      "Bella Vista",
      "West Memphis",
      "Paragould",
      "Cabot",
      "Searcy",
      "Van Buren",
      "El Dorado",
      "Maumelle",
      "Bryant",
    ],
    California: [
      "Los Angeles",
      "San Diego",
      "San Jose",
      "San Francisco",
      "Fresno",
      "Sacramento",
      "Long Beach",
      "Oakland",
      "Bakersfield",
      "Anaheim",
      "Santa Ana",
      "Riverside",
      "Stockton",
      "Irvine",
      "Chula Vista",
      "Fremont",
      "San Bernardino",
      "Modesto",
      "Fontana",
      "Oxnard",
      "Moreno Valley",
      "Huntington Beach",
      "Glendale",
      "Santa Clarita",
      "Garden Grove",
      "Oceanside",
      "Rancho Cucamonga",
      "Santa Rosa",
      "Ontario",
      "Elk Grove",
    ],
    Colorado: [
      "Denver",
      "Colorado Springs",
      "Aurora",
      "Fort Collins",
      "Lakewood",
      "Thornton",
      "Arvada",
      "Westminster",
      "Pueblo",
      "Centennial",
      "Boulder",
      "Greeley",
      "Longmont",
      "Loveland",
      "Grand Junction",
      "Broomfield",
      "Castle Rock",
      "Commerce City",
      "Parker",
      "Littleton",
      "Northglenn",
      "Brighton",
      "Englewood",
      "Wheat Ridge",
      "Fountain",
    ],
    Connecticut: [
      "Bridgeport",
      "New Haven",
      "Hartford",
      "Stamford",
      "Waterbury",
      "Norwalk",
      "Danbury",
      "New Britain",
      "West Hartford",
      "Greenwich",
      "Hamden",
      "Meriden",
      "Bristol",
      "Manchester",
      "West Haven",
      "Milford",
      "Stratford",
      "East Hartford",
      "Middletown",
      "Wallingford",
      "Enfield",
      "Southington",
      "Shelton",
      "Norwich",
      "Groton",
    ],
    Delaware: [
      "Wilmington",
      "Dover",
      "Newark",
      "Middletown",
      "Smyrna",
      "Milford",
      "Seaford",
      "Georgetown",
      "Elsmere",
      "New Castle",
      "Millsboro",
      "Laurel",
      "Harrington",
      "Camden",
      "Clayton",
      "Lewes",
      "Milton",
      "Selbyville",
      "Bridgeville",
      "Townsend",
      "Ocean View",
      "Rehoboth Beach",
      "Cheswold",
      "Wyoming",
      "Delmar",
    ],
    Florida: [
      "Jacksonville",
      "Miami",
      "Tampa",
      "Orlando",
      "St. Petersburg",
      "Hialeah",
      "Tallahassee",
      "Fort Lauderdale",
      "Port St. Lucie",
      "Cape Coral",
      "Pembroke Pines",
      "Hollywood",
      "Miramar",
      "Gainesville",
      "Coral Springs",
      "Clearwater",
      "Miami Gardens",
      "Palm Bay",
      "West Palm Beach",
      "Pompano Beach",
      "Lakeland",
      "Davie",
      "Miami Beach",
      "Sunrise",
      "Plantation",
      "Boca Raton",
      "Deltona",
      "Largo",
      "Palm Coast",
      "Melbourne",
    ],
    Georgia: [
      "Atlanta",
      "Augusta",
      "Columbus",
      "Macon",
      "Savannah",
      "Athens",
      "Sandy Springs",
      "Roswell",
      "Johns Creek",
      "Albany",
      "Warner Robins",
      "Alpharetta",
      "Marietta",
      "Smyrna",
      "Valdosta",
      "Dunwoody",
      "Rome",
      "East Point",
      "Milton",
      "Gainesville",
      "Hinesville",
      "Peachtree City",
      "Newnan",
      "Dalton",
      "Douglasville",
      "Kennesaw",
      "LaGrange",
      "Statesboro",
      "Lawrenceville",
      "Duluth",
    ],
    Hawaii: [
      "Honolulu",
      "East Honolulu",
      "Pearl City",
      "Hilo",
      "Kailua",
      "Waipahu",
      "Kaneohe",
      "Mililani Town",
      "Kahului",
      "Ewa Gentry",
      "Kihei",
      "Makakilo",
      "Wahiawa",
      "Schofield Barracks",
      "Wailuku",
      "Kapolei",
      "Ewa Beach",
      "Royal Kunia",
      "Halawa",
      "Waimalu",
      "Waianae",
      "Nanakuli",
      "Kailua-Kona",
      "Lihue",
      "Waimea",
    ],
    Idaho: [
      "Boise",
      "Meridian",
      "Nampa",
      "Idaho Falls",
      "Pocatello",
      "Caldwell",
      "Coeur d'Alene",
      "Twin Falls",
      "Lewiston",
      "Post Falls",
      "Rexburg",
      "Eagle",
      "Moscow",
      "Mountain Home",
      "Kuna",
      "Ammon",
      "Chubbuck",
      "Hayden",
      "Garden City",
      "Jerome",
      "Burley",
      "Sandpoint",
      "Hailey",
      "Blackfoot",
      "Rathdrum",
    ],
    Illinois: [
      "Chicago",
      "Aurora",
      "Rockford",
      "Joliet",
      "Naperville",
      "Springfield",
      "Peoria",
      "Elgin",
      "Waukegan",
      "Cicero",
      "Champaign",
      "Bloomington",
      "Arlington Heights",
      "Evanston",
      "Decatur",
      "Schaumburg",
      "Bolingbrook",
      "Palatine",
      "Skokie",
      "Des Plaines",
      "Orland Park",
      "Tinley Park",
      "Oak Lawn",
      "Berwyn",
      "Mount Prospect",
      "Normal",
      "Wheaton",
      "Hoffman Estates",
      "Oak Park",
      "Downers Grove",
    ],
    Indiana: [
      "Indianapolis",
      "Fort Wayne",
      "Evansville",
      "South Bend",
      "Carmel",
      "Fishers",
      "Bloomington",
      "Hammond",
      "Gary",
      "Muncie",
      "Lafayette",
      "Terre Haute",
      "Kokomo",
      "Anderson",
      "Noblesville",
      "Greenwood",
      "Elkhart",
      "Mishawaka",
      "Lawrence",
      "Jeffersonville",
      "Columbus",
      "Portage",
      "New Albany",
      "Richmond",
      "Valparaiso",
      "Michigan City",
      "West Lafayette",
      "Marion",
      "Goshen",
      "Hobart",
    ],
    Iowa: [
      "Des Moines",
      "Cedar Rapids",
      "Davenport",
      "Sioux City",
      "Iowa City",
      "Waterloo",
      "Council Bluffs",
      "Ames",
      "West Des Moines",
      "Dubuque",
      "Ankeny",
      "Urbandale",
      "Cedar Falls",
      "Marion",
      "Bettendorf",
      "Mason City",
      "Clinton",
      "Burlington",
      "Fort Dodge",
      "Marshalltown",
      "Muscatine",
      "Coralville",
      "Johnston",
      "Waukee",
      "Altoona",
      "North Liberty",
      "Newton",
      "Indianola",
      "Oskaloosa",
      "Spencer",
    ],
    Kansas: [
      "Wichita",
      "Overland Park",
      "Kansas City",
      "Topeka",
      "Olathe",
      "Lawrence",
      "Shawnee",
      "Manhattan",
      "Lenexa",
      "Salina",
      "Hutchinson",
      "Leavenworth",
      "Leawood",
      "Dodge City",
      "Garden City",
      "Junction City",
      "Emporia",
      "Derby",
      "Prairie Village",
      "Hays",
      "Liberal",
      "Gardner",
      "Great Bend",
      "Newton",
      "McPherson",
      "El Dorado",
      "Ottawa",
      "Winfield",
      "Arkansas City",
      "Andover",
    ],
    Kentucky: [
      "Louisville",
      "Lexington",
      "Bowling Green",
      "Owensboro",
      "Covington",
      "Richmond",
      "Georgetown",
      "Florence",
      "Hopkinsville",
      "Nicholasville",
      "Frankfort",
      "Henderson",
      "Jeffersontown",
      "Elizabethtown",
      "Radcliff",
      "Ashland",
      "Madisonville",
      "Independence",
      "Paducah",
      "Winchester",
      "Erlanger",
      "Murray",
      "St. Matthews",
      "Fort Thomas",
      "Danville",
      "Newport",
      "Shively",
      "Shelbyville",
      "Glasgow",
      "Berea",
    ],
    Louisiana: [
      "New Orleans",
      "Baton Rouge",
      "Shreveport",
      "Lafayette",
      "Lake Charles",
      "Kenner",
      "Bossier City",
      "Monroe",
      "Alexandria",
      "Houma",
      "Marrero",
      "New Iberia",
      "Metairie",
      "Slidell",
      "Hammond",
      "Prairieville",
      "Central",
      "Ruston",
      "Zachary",
      "Thibodaux",
      "Natchitoches",
      "Gretna",
      "Opelousas",
      "Pineville",
      "Sulphur",
      "Bayou Cane",
      "Shenandoah",
      "Chalmette",
      "Terrytown",
      "Mandeville",
    ],
    Maine: [
      "Portland",
      "Lewiston",
      "Bangor",
      "South Portland",
      "Auburn",
      "Biddeford",
      "Sanford",
      "Saco",
      "Augusta",
      "Westbrook",
      "Waterville",
      "Presque Isle",
      "Brewer",
      "Bath",
      "Caribou",
      "Old Town",
      "Rockland",
      "Belfast",
      "Gardiner",
      "Ellsworth",
      "Kittery",
      "Houlton",
      "Orono",
      "Scarborough",
      "Yarmouth",
      "Kennebunk",
      "Topsham",
      "Falmouth",
      "Winslow",
      "Gorham",
    ],
    Maryland: [
      "Baltimore",
      "Frederick",
      "Rockville",
      "Gaithersburg",
      "Bowie",
      "Hagerstown",
      "Annapolis",
      "College Park",
      "Salisbury",
      "Laurel",
      "Greenbelt",
      "Cumberland",
      "Westminster",
      "Hyattsville",
      "Takoma Park",
      "Easton",
      "Aberdeen",
      "Elkton",
      "Havre de Grace",
      "Cambridge",
      "New Carrollton",
      "Frostburg",
      "Riverdale Park",
      "Mount Rainier",
      "Bladensburg",
      "Cheverly",
      "Ocean City",
      "Glenarden",
      "District Heights",
      "Poolesville",
    ],
    Massachusetts: [
      "Boston",
      "Worcester",
      "Springfield",
      "Lowell",
      "Cambridge",
      "New Bedford",
      "Brockton",
      "Quincy",
      "Lynn",
      "Fall River",
      "Newton",
      "Lawrence",
      "Somerville",
      "Framingham",
      "Haverhill",
      "Waltham",
      "Malden",
      "Brookline",
      "Plymouth",
      "Medford",
      "Taunton",
      "Chicopee",
      "Weymouth",
      "Revere",
      "Peabody",
      "Methuen",
      "Barnstable",
      "Pittsfield",
      "Attleboro",
      "Arlington",
    ],
    Michigan: [
      "Detroit",
      "Grand Rapids",
      "Warren",
      "Sterling Heights",
      "Lansing",
      "Ann Arbor",
      "Flint",
      "Dearborn",
      "Livonia",
      "Westland",
      "Troy",
      "Farmington Hills",
      "Kalamazoo",
      "Wyoming",
      "Southfield",
      "Rochester Hills",
      "Taylor",
      "St. Clair Shores",
      "Pontiac",
      "Dearborn Heights",
      "Royal Oak",
      "Novi",
      "Battle Creek",
      "Saginaw",
      "Kentwood",
      "East Lansing",
      "Roseville",
      "Portage",
      "Midland",
      "Muskegon",
    ],
    Minnesota: [
      "Minneapolis",
      "Saint Paul",
      "Rochester",
      "Duluth",
      "Bloomington",
      "Brooklyn Park",
      "Plymouth",
      "Saint Cloud",
      "Eagan",
      "Woodbury",
      "Maple Grove",
      "Eden Prairie",
      "Coon Rapids",
      "Burnsville",
      "Blaine",
      "Lakeville",
      "Minnetonka",
      "Apple Valley",
      "Edina",
      "St. Louis Park",
      "Mankato",
      "Maplewood",
      "Moorhead",
      "Shakopee",
      "Richfield",
      "Cottage Grove",
      "Roseville",
      "Inver Grove Heights",
      "Andover",
      "Brooklyn Center",
    ],
    Mississippi: [
      "Jackson",
      "Gulfport",
      "Southaven",
      "Hattiesburg",
      "Biloxi",
      "Meridian",
      "Tupelo",
      "Greenville",
      "Olive Branch",
      "Horn Lake",
      "Clinton",
      "Pearl",
      "Madison",
      "Starkville",
      "Ridgeland",
      "Columbus",
      "Vicksburg",
      "Oxford",
      "Pascagoula",
      "Brandon",
      "Gautier",
      "Laurel",
      "Clarksdale",
      "Ocean Springs",
      "Natchez",
      "Greenwood",
      "Long Beach",
      "Corinth",
      "Hernando",
      "Moss Point",
    ],
    Missouri: [
      "Kansas City",
      "Saint Louis",
      "Springfield",
      "Independence",
      "Columbia",
      "Lee's Summit",
      "O'Fallon",
      "St. Joseph",
      "St. Charles",
      "St. Peters",
      "Blue Springs",
      "Florissant",
      "Joplin",
      "Chesterfield",
      "Jefferson City",
      "Cape Girardeau",
      "Wentzville",
      "University City",
      "Ballwin",
      "Raytown",
      "Liberty",
      "Kirkwood",
      "Maryland Heights",
      "Hazelwood",
      "Gladstone",
      "Grandview",
      "Belton",
      "Webster Groves",
      "Sedalia",
      "Ferguson",
    ],
    Montana: [
      "Billings",
      "Missoula",
      "Great Falls",
      "Bozeman",
      "Butte",
      "Helena",
      "Kalispell",
      "Havre",
      "Anaconda",
      "Miles City",
      "Belgrade",
      "Livingston",
      "Laurel",
      "Whitefish",
      "Lewistown",
      "Glendive",
      "Sidney",
      "Columbia Falls",
      "Polson",
      "Hamilton",
      "Dillon",
      "Hardin",
      "Red Lodge",
      "Shelby",
      "Cut Bank",
      "Wolf Point",
      "Colstrip",
      "Conrad",
      "Deer Lodge",
      "Libby",
    ],
    Nebraska: [
      "Omaha",
      "Lincoln",
      "Bellevue",
      "Grand Island",
      "Kearney",
      "Fremont",
      "Hastings",
      "North Platte",
      "Norfolk",
      "Columbus",
      "Papillion",
      "La Vista",
      "Scottsbluff",
      "South Sioux City",
      "Beatrice",
      "Lexington",
      "Alliance",
      "Gering",
      "Blair",
      "York",
      "McCook",
      "Seward",
      "Crete",
      "Ralston",
      "Chadron",
      "Wayne",
      "Holdrege",
      "Sidney",
      "Schuyler",
      "Ogallala",
    ],
    Nevada: [
      "Las Vegas",
      "Henderson",
      "Reno",
      "North Las Vegas",
      "Sparks",
      "Carson City",
      "Fernley",
      "Elko",
      "Mesquite",
      "Boulder City",
      "Fallon",
      "Winnemucca",
      "West Wendover",
      "Ely",
      "Yerington",
      "Carlin",
      "Lovelock",
      "Wells",
      "Caliente",
      "Pahrump",
      "Gardnerville",
      "Minden",
      "Incline Village",
      "Laughlin",
      "Moapa Valley",
      "Spring Creek",
      "Tonopah",
      "Jackpot",
      "Silver Springs",
      "Searchlight",
    ],
    "New Hampshire": [
      "Manchester",
      "Nashua",
      "Concord",
      "Derry",
      "Dover",
      "Rochester",
      "Salem",
      "Merrimack",
      "Hudson",
      "Londonderry",
      "Keene",
      "Bedford",
      "Portsmouth",
      "Goffstown",
      "Laconia",
      "Hampton",
      "Milford",
      "Durham",
      "Exeter",
      "Windham",
      "Hooksett",
      "Claremont",
      "Lebanon",
      "Pelham",
      "Somersworth",
      "Hanover",
      "Amherst",
      "Raymond",
      "Conway",
      "Berlin",
    ],
    "New Jersey": [
      "Newark",
      "Jersey City",
      "Paterson",
      "Elizabeth",
      "Edison",
      "Woodbridge",
      "Lakewood",
      "Toms River",
      "Hamilton",
      "Trenton",
      "Clifton",
      "Camden",
      "Brick",
      "Cherry Hill",
      "Passaic",
      "Middletown",
      "Union City",
      "Old Bridge",
      "Gloucester Township",
      "East Orange",
      "Bayonne",
      "Franklin",
      "North Bergen",
      "Vineland",
      "Union",
      "Piscataway",
      "New Brunswick",
      "Jackson",
      "Wayne",
      "Irvington",
    ],
    "New Mexico": [
      "Albuquerque",
      "Las Cruces",
      "Rio Rancho",
      "Santa Fe",
      "Roswell",
      "Farmington",
      "Clovis",
      "Hobbs",
      "Alamogordo",
      "Carlsbad",
      "Gallup",
      "Deming",
      "Los Lunas",
      "Chaparral",
      "Sunland Park",
      "Las Vegas",
      "Portales",
      "Artesia",
      "Silver City",
      "Lovington",
      "Espanola",
      "Bernalillo",
      "Socorro",
      "Grants",
      "Los Alamos",
      "Ruidoso",
      "Corrales",
      "Truth or Consequences",
      "Taos",
      "Aztec",
    ],
    "New York": [
      "New York City",
      "Buffalo",
      "Rochester",
      "Yonkers",
      "Syracuse",
      "Albany",
      "New Rochelle",
      "Mount Vernon",
      "Schenectady",
      "Utica",
      "White Plains",
      "Hempstead",
      "Troy",
      "Niagara Falls",
      "Binghamton",
      "Freeport",
      "Valley Stream",
      "Long Beach",
      "Rome",
      "North Tonawanda",
      "Ithaca",
      "Poughkeepsie",
      "Jamestown",
      "Elmira",
      "Saratoga Springs",
      "Watertown",
      "Auburn",
      "Glen Cove",
      "Newburgh",
      "Middletown",
    ],
    "North Carolina": [
      "Charlotte",
      "Raleigh",
      "Greensboro",
      "Durham",
      "Winston-Salem",
      "Fayetteville",
      "Cary",
      "Wilmington",
      "High Point",
      "Greenville",
      "Asheville",
      "Concord",
      "Gastonia",
      "Jacksonville",
      "Chapel Hill",
      "Rocky Mount",
      "Burlington",
      "Wilson",
      "Huntersville",
      "Kannapolis",
      "Apex",
      "Hickory",
      "Goldsboro",
      "Salisbury",
      "Matthews",
      "Monroe",
      "Sanford",
      "Garner",
      "New Bern",
      "Statesville",
    ],
    "North Dakota": [
      "Fargo",
      "Bismarck",
      "Grand Forks",
      "Minot",
      "West Fargo",
      "Williston",
      "Dickinson",
      "Mandan",
      "Jamestown",
      "Wahpeton",
      "Devils Lake",
      "Valley City",
      "Grafton",
      "Beulah",
      "Rugby",
      "Horace",
      "Lincoln",
      "Watford City",
      "Casselton",
      "Hazen",
      "Bottineau",
      "Lisbon",
      "Carrington",
      "Langdon",
      "Oakes",
      "Harvey",
      "Stanley",
      "Bowman",
      "Hillsboro",
      "Garrison",
    ],
    Ohio: [
      "Columbus",
      "Cleveland",
      "Cincinnati",
      "Toledo",
      "Akron",
      "Dayton",
      "Parma",
      "Canton",
      "Youngstown",
      "Lorain",
      "Hamilton",
      "Springfield",
      "Kettering",
      "Elyria",
      "Lakewood",
      "Cuyahoga Falls",
      "Middletown",
      "Euclid",
      "Newark",
      "Mansfield",
      "Mentor",
      "Beavercreek",
      "Cleveland Heights",
      "Strongsville",
      "Dublin",
      "Fairfield",
      "Findlay",
      "Warren",
      "Lancaster",
      "Lima",
    ],
    Oklahoma: [
      "Oklahoma City",
      "Tulsa",
      "Norman",
      "Broken Arrow",
      "Lawton",
      "Edmond",
      "Moore",
      "Midwest City",
      "Enid",
      "Stillwater",
      "Muskogee",
      "Bartlesville",
      "Owasso",
      "Ponca City",
      "Ardmore",
      "Shawnee",
      "Yukon",
      "Duncan",
      "Bethany",
      "Mustang",
      "Del City",
      "Sapulpa",
      "Bixby",
      "Claremore",
      "Miami",
      "El Reno",
      "McAlester",
      "Ada",
      "Durant",
      "Chickasha",
    ],
    Oregon: [
      "Portland",
      "Eugene",
      "Salem",
      "Gresham",
      "Hillsboro",
      "Bend",
      "Beaverton",
      "Medford",
      "Springfield",
      "Corvallis",
      "Albany",
      "Tigard",
      "Lake Oswego",
      "Keizer",
      "Grants Pass",
      "Oregon City",
      "McMinnville",
      "Redmond",
      "Tualatin",
      "West Linn",
      "Woodburn",
      "Forest Grove",
      "Newberg",
      "Roseburg",
      "Klamath Falls",
      "Ashland",
      "Wilsonville",
      "Milwaukie",
      "Sherwood",
      "Central Point",
    ],
    Pennsylvania: [
      "Philadelphia",
      "Pittsburgh",
      "Allentown",
      "Erie",
      "Reading",
      "Scranton",
      "Bethlehem",
      "Lancaster",
      "Harrisburg",
      "Altoona",
      "York",
      "State College",
      "Wilkes-Barre",
      "Chester",
      "Norristown",
      "Bethel Park",
      "Williamsport",
      "Monroeville",
      "Plum",
      "Easton",
      "New Castle",
      "Lebanon",
      "McKeesport",
      "Hazleton",
      "Johnstown",
      "Chambersburg",
      "Carlisle",
      "Hermitage",
      "Greensburg",
      "Washington",
    ],
    "Rhode Island": [
      "Providence",
      "Warwick",
      "Cranston",
      "Pawtucket",
      "East Providence",
      "Woonsocket",
      "Newport",
      "Central Falls",
      "Westerly",
      "North Providence",
      "Cumberland",
      "West Warwick",
      "Johnston",
      "North Kingstown",
      "South Kingstown",
      "Coventry",
      "Bristol",
      "Smithfield",
      "Lincoln",
      "Barrington",
      "Middletown",
      "Portsmouth",
      "Narragansett",
      "Warren",
      "East Greenwich",
      "Tiverton",
      "Burrillville",
      "Scituate",
      "Glocester",
      "Hopkinton",
    ],
    "South Carolina": [
      "Columbia",
      "Charleston",
      "North Charleston",
      "Mount Pleasant",
      "Rock Hill",
      "Greenville",
      "Summerville",
      "Sumter",
      "Goose Creek",
      "Hilton Head Island",
      "Florence",
      "Spartanburg",
      "Myrtle Beach",
      "Aiken",
      "Greer",
      "Anderson",
      "Mauldin",
      "Greenwood",
      "North Augusta",
      "Easley",
      "Simpsonville",
      "Hanahan",
      "Lexington",
      "Conway",
      "West Columbia",
      "North Myrtle Beach",
      "Clemson",
      "Orangeburg",
      "Cayce",
      "Bluffton",
    ],
    "South Dakota": [
      "Sioux Falls",
      "Rapid City",
      "Aberdeen",
      "Brookings",
      "Watertown",
      "Mitchell",
      "Yankton",
      "Pierre",
      "Huron",
      "Vermillion",
      "Brandon",
      "Box Elder",
      "Spearfish",
      "Sturgis",
      "Madison",
      "Belle Fourche",
      "Tea",
      "Dell Rapids",
      "Hot Springs",
      "Lead",
      "Harrisburg",
      "Canton",
      "Milbank",
      "Mobridge",
      "Winner",
      "Chamberlain",
      "Redfield",
      "Sisseton",
      "Custer",
      "Flandreau",
    ],
    Tennessee: [
      "Nashville",
      "Memphis",
      "Knoxville",
      "Chattanooga",
      "Clarksville",
      "Murfreesboro",
      "Franklin",
      "Johnson City",
      "Bartlett",
      "Hendersonville",
      "Kingsport",
      "Jackson",
      "Smyrna",
      "Cleveland",
      "Brentwood",
      "Germantown",
      "Columbia",
      "Spring Hill",
      "La Vergne",
      "Gallatin",
      "Lebanon",
      "Mount Juliet",
      "Cookeville",
      "Morristown",
      "Oak Ridge",
      "Collierville",
      "Farragut",
      "East Ridge",
      "Shelbyville",
      "Tullahoma",
    ],
    Texas: [
      "Houston",
      "San Antonio",
      "Dallas",
      "Austin",
      "Fort Worth",
      "El Paso",
      "Arlington",
      "Corpus Christi",
      "Plano",
      "Lubbock",
      "Laredo",
      "Irving",
      "Garland",
      "Amarillo",
      "Grand Prairie",
      "Brownsville",
      "McKinney",
      "Frisco",
      "Pasadena",
      "Mesquite",
      "McAllen",
      "Killeen",
      "Waco",
      "Carrollton",
      "Denton",
      "Midland",
      "Abilene",
      "Beaumont",
      "Round Rock",
      "Odessa",
      "Richardson",
      "Wichita Falls",
      "College Station",
      "Pearland",
      "Lewisville",
    ],
    Utah: [
      "Salt Lake City",
      "West Valley City",
      "Provo",
      "West Jordan",
      "Orem",
      "Sandy",
      "Ogden",
      "St. George",
      "Layton",
      "South Jordan",
      "Lehi",
      "Millcreek",
      "Taylorsville",
      "Logan",
      "Murray",
      "Draper",
      "Bountiful",
      "Riverton",
      "Roy",
      "Spanish Fork",
      "Pleasant Grove",
      "Cottonwood Heights",
      "Tooele",
      "Springville",
      "Cedar City",
      "Kaysville",
      "Herriman",
      "Midvale",
      "American Fork",
      "Syracuse",
    ],
    Vermont: [
      "Burlington",
      "Essex",
      "South Burlington",
      "Colchester",
      "Rutland",
      "Bennington",
      "Brattleboro",
      "Milton",
      "Hartford",
      "Barre",
      "Williston",
      "Springfield",
      "St. Johnsbury",
      "Montpelier",
      "Middlebury",
      "St. Albans",
      "Winooski",
      "Newport",
      "Morristown",
      "Randolph",
      "Lyndon",
      "Jericho",
      "Shelburne",
      "Swanton",
      "Vergennes",
      "Richmond",
      "Bristol",
      "Hinesburg",
      "Waterbury",
      "Manchester",
    ],
    Virginia: [
      "Virginia Beach",
      "Norfolk",
      "Chesapeake",
      "Richmond",
      "Newport News",
      "Alexandria",
      "Hampton",
      "Portsmouth",
      "Suffolk",
      "Roanoke",
      "Lynchburg",
      "Harrisonburg",
      "Leesburg",
      "Charlottesville",
      "Danville",
      "Blacksburg",
      "Manassas",
      "Petersburg",
      "Winchester",
      "Salem",
      "Fredericksburg",
      "Staunton",
      "Fairfax",
      "Hopewell",
      "Waynesboro",
      "Herndon",
      "Christiansburg",
      "Vienna",
      "Falls Church",
      "Culpeper",
    ],
    Washington: [
      "Seattle",
      "Spokane",
      "Tacoma",
      "Vancouver",
      "Bellevue",
      "Kent",
      "Everett",
      "Renton",
      "Yakima",
      "Federal Way",
      "Spokane Valley",
      "Bellingham",
      "Kennewick",
      "Auburn",
      "Pasco",
      "Marysville",
      "Lakewood",
      "Redmond",
      "Shoreline",
      "Richland",
      "Kirkland",
      "Edmonds",
      "Olympia",
      "Sammamish",
      "Lacey",
      "Burien",
      "Bothell",
      "Wenatchee",
      "Mount Vernon",
      "Walla Walla",
    ],
    "West Virginia": [
      "Charleston",
      "Huntington",
      "Parkersburg",
      "Morgantown",
      "Wheeling",
      "Martinsburg",
      "Fairmont",
      "Beckley",
      "Clarksburg",
      "Lewisburg",
      "South Charleston",
      "St. Albans",
      "Vienna",
      "Bluefield",
      "Weirton",
      "Moundsville",
      "Bridgeport",
      "Dunbar",
      "Elkins",
      "Nitro",
      "Princeton",
      "Hurricane",
      "Grafton",
      "Point Pleasant",
      "Buckhannon",
      "New Martinsville",
      "Ripley",
      "Ravenswood",
      "Williamson",
      "Welch",
    ],
    Wisconsin: [
      "Milwaukee",
      "Madison",
      "Green Bay",
      "Kenosha",
      "Racine",
      "Appleton",
      "Waukesha",
      "Eau Claire",
      "Oshkosh",
      "Janesville",
      "West Allis",
      "La Crosse",
      "Sheboygan",
      "Wauwatosa",
      "Fond du Lac",
      "New Berlin",
      "Wausau",
      "Brookfield",
      "Beloit",
      "Greenfield",
      "Franklin",
      "Oak Creek",
      "Manitowoc",
      "West Bend",
      "Sun Prairie",
      "Superior",
      "Stevens Point",
      "Neenah",
      "Fitchburg",
      "Muskego",
    ],
    Wyoming: [
      "Cheyenne",
      "Casper",
      "Laramie",
      "Gillette",
      "Rock Springs",
      "Sheridan",
      "Green River",
      "Evanston",
      "Riverton",
      "Jackson",
      "Cody",
      "Rawlins",
      "Lander",
      "Torrington",
      "Powell",
      "Douglas",
      "Worland",
      "Buffalo",
      "Mills",
      "Thermopolis",
      "Wheatland",
      "Newcastle",
      "Glenrock",
      "Kemmerer",
      "Lyman",
      "Lovell",
      "Pinedale",
      "Saratoga",
      "Greybull",
      "Afton",
    ],
  }

  return (citiesByState[state] || []).filter((city) => city.trim() !== "")
}

// Main SellPage component
export default function SellPage() {
  // Auth context and state variables
  const { user, profile, loading: authLoading, signOut } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)

  // Form data state
  const [formData, setFormData] = useState({
    // Vehicle Category
    vehicleCategory: "",

    // Vehicle Details
    make: "",
    model: "",
    customMake: "",
    customModel: "",
    year: "",
    mileage: "",
    vin: "",
    bodyType: "",
    fuelType: "",
    transmission: "",
    exteriorColor: "",
    customExteriorColor: "",
    interiorColor: "",
    customInteriorColor: "",

    // Pricing & Condition
    price: "",
    condition: "",

    // Photos
    photos: [] as string[],

    // Description & Features
    description: "",
    selectedFeatures: [] as string[],

    // Additional
    negotiable: false,
    tradeConsidered: false,
    financingAvailable: false,

    // Location
    state: "",
    city: "",
  })

  // State variables for makes, models, and loading states
  const [availableMakes, setAvailableMakes] = useState<Array<{ id: string; name: string }>>([])
  const [availableModels, setAvailableModels] = useState<Array<{ id: string; name: string; body_type: string }>>([])
  const [isLoadingMakes, setIsLoadingMakes] = useState(false)
  const [isLoadingModels, setIsLoadingModels] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // State variables for photo uploads
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [isPublishing, setIsPublishing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Router and search params
  const router = useRouter()
  const searchParams = useSearchParams()
  const editListingId = searchParams.get("edit")
  const isEditMode = !!editListingId

  // Total steps and progress calculation
  const totalSteps = 5
  const progress = useMemo(() => (currentStep / totalSteps) * 100, [currentStep])

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/sign-in")
    }
  }, [authLoading, user, router])

  // Load existing listing data when in edit mode
  useEffect(() => {
    if (isEditMode && editListingId && user) {
      loadExistingListing(editListingId)
    }
  }, [isEditMode, editListingId, user])

  // Function to load existing listing data
  const loadExistingListing = async (listingId: string) => {
    try {
      setIsLoading(true)

      const { data: listingData, error } = await supabase
        .from("listings")
        .select(`
         *,
         listing_photos (photo_url, is_main_photo, sort_order),
         listing_features (feature_name)
       `)
        .eq("id", listingId)
        .eq("seller_id", user.id)
        .single()

      if (error) throw error

      // Populate form data with existing listing
      setFormData({
        vehicleCategory: listingData.vehicle_category || "cars-trucks",
        make: listingData.make || "",
        model: listingData.model || "",
        customMake: "",
        customModel: "",
        year: listingData.year?.toString() || "",
        mileage: listingData.mileage?.toString() || "",
        vin: listingData.vin || "",
        bodyType: listingData.body_type || "",
        fuelType: listingData.fuel_type || "",
        transmission: listingData.transmission || "",
        exteriorColor: listingData.exterior_color || "",
        customExteriorColor: "",
        interiorColor: listingData.interior_color || "",
        customInteriorColor: "",
        price: listingData.price?.toString() || "",
        condition: getConditionValue(listingData.condition),
        photos: listingData.listing_photos?.sort((a, b) => a.sort_order - b.sort_order)?.map((p) => p.photo_url) || [],
        description: listingData.description || "",
        selectedFeatures: listingData.listing_features?.map((f) => f.feature_name) || [],
        negotiable: Boolean(listingData.negotiable),
        tradeConsidered: Boolean(listingData.trade_considered),
        financingAvailable: Boolean(listingData.financing_available),
        state: "",
        city: "",
      })

      // Load photos
      const photos =
        listingData.listing_photos?.sort((a, b) => a.sort_order - b.sort_order)?.map((p) => p.photo_url) || []
      setUploadedPhotos(photos)
    } catch (error) {
      console.error("Error loading listing:", error)
      alert("Failed to load listing for editing")
      router.push("/dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  // Function to get condition value
  const getConditionValue = (conditionLabel: string) => {
    const condition = conditions.find((c) => c.label === conditionLabel)
    return condition ? condition.value : "good"
  }

  // Function to handle input change
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Function to handle feature toggle
  const handleFeatureToggle = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedFeatures: prev.selectedFeatures.includes(feature)
        ? prev.selectedFeatures.filter((f) => f !== feature)
        : [...prev.selectedFeatures, feature],
    }))
  }

  // Handle photo upload from device
  const handlePhotoUpload = () => {
    if (uploadedPhotos.length >= MAX_PHOTOS) {
      setUploadError(`Maximum ${MAX_PHOTOS} photos allowed.`)
      return
    }
    fileInputRef.current?.click()
  }

  // Handle file selection and upload to Supabase
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadError("")

    try {
      const newPhotos: string[] = []

      for (let i = 0; i < files.length; i++) {
        if (uploadedPhotos.length + newPhotos.length >= MAX_PHOTOS) {
          setUploadError(`Maximum ${MAX_PHOTOS} photos allowed. Some files were not uploaded.`)
          break
        }

        const file = files[i]
        const validationError = validateFile(file)

        if (validationError) {
          setUploadError(validationError)
          continue
        }

        try {
          // Generate unique filename
          const fileExt = file.name.split(".").pop()
          const fileName = `temp-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
          const filePath = `temp/${fileName}`

          // Upload to Supabase Storage
          const { data, error } = await supabase.storage.from("listing-photos").upload(filePath, file)

          if (error) {
            console.error("Error uploading photo:", error)
            setUploadError("Error uploading photo. Please try again.")
            continue
          }

          // Get public URL
          const {
            data: { publicUrl },
          } = supabase.storage.from("listing-photos").getPublicUrl(filePath)

          newPhotos.push(publicUrl)
        } catch (error) {
          console.error("Error uploading photo:", error)
          setUploadError("Error uploading photo. Please try again.")
        }
      }

      if (newPhotos.length > 0) {
        setUploadedPhotos((prev) => [...prev, ...newPhotos])
        setFormData((prev) => ({ ...prev, photos: [...prev.photos, ...newPhotos] }))
      }
    } catch (error) {
      console.error("Error uploading photos:", error)
      setUploadError("Error uploading photos. Please try again.")
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Function to remove a photo
  const removePhoto = async (index: number) => {
    const photoUrl = uploadedPhotos[index]

    // Extract file path from URL to delete from storage
    if (photoUrl && photoUrl.includes("/temp/")) {
      try {
        const urlParts = photoUrl.split("/temp/")
        if (urlParts.length > 1) {
          const filePath = `temp/${urlParts[1]}`
          await supabase.storage.from("listing-photos").remove([filePath])
        }
      } catch (error) {
        console.error("Error deleting photo from storage:", error)
      }
    }

    const newPhotos = uploadedPhotos.filter((_, i) => i !== index)
    setUploadedPhotos(newPhotos)
    setFormData((prev) => ({ ...prev, photos: newPhotos }))
    setUploadError("")
  }

  // Function to go to the next step
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  // Function to go to the previous step
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Function to get current vehicle data
  const getCurrentVehicleData = () => {
    return vehicleData[formData.vehicleCategory as keyof typeof vehicleData] || vehicleData["cars-trucks"]
  }

  // Function to get current features
  const getCurrentFeatures = () => {
    return features[formData.vehicleCategory as keyof typeof features] || features["cars-trucks"]
  }

  // Replace the existing fetchMakes function with this updated version that uses our new database
  const fetchMakes = async (category: string) => {
    setIsLoadingMakes(true)
    try {
      // Use our comprehensive local database as the primary source
      const filteredMakes = vehicleDatabase
        .filter((make) => make.category === category)
        .map((make) => ({ id: make.name.toLowerCase(), name: make.name }))
        .sort((a, b) => a.name.localeCompare(b.name))

      setAvailableMakes(filteredMakes)
    } catch (error) {
      console.error("Error loading makes:", error)
      setAvailableMakes([])
    } finally {
      setIsLoadingMakes(false)
    }
  }

  // Replace the existing fetchModels function with this updated version that uses our comprehensive database
  const fetchModels = async (makeId: string, year: string) => {
    if (!makeId || !year) {
      setAvailableModels([])
      return
    }

    setIsLoadingModels(true)
    try {
      // Use our comprehensive local database as the primary source
      const makeName = availableMakes.find((make) => make.id === makeId)?.name

      if (makeName) {
        const make = vehicleDatabase.find((m) => m.name.toLowerCase() === makeName.toLowerCase())

        if (make) {
          const yearNumber = Number.parseInt(year)
          const filteredModels = make.models
            .filter((model) => model.yearStart <= yearNumber && (!model.yearEnd || model.yearEnd >= yearNumber))
            .map((model) => ({
              id: model.name.toLowerCase(),
              name: model.name,
              body_type: model.bodyType,
            }))
            .sort((a, b) => a.name.localeCompare(b.name))

          setAvailableModels(filteredModels)
        } else {
          setAvailableModels([])
        }
      } else {
        setAvailableModels([])
      }
    } catch (error) {
      console.error("Error loading models:", error)
      setAvailableModels([])
    } finally {
      setIsLoadingModels(false)
    }
  }

  // Fetch makes when vehicle category changes
  useEffect(() => {
    if (formData.vehicleCategory) {
      fetchMakes(formData.vehicleCategory)
      // Reset make and model when category changes
      setFormData((prev) => ({ ...prev, make: "", model: "" }))
      setAvailableModels([])
    }
  }, [formData.vehicleCategory])

  // Fetch models when make or year changes
  useEffect(() => {
    if (
      (formData.make && formData.make !== "other" && formData.year) ||
      (formData.make === "other" && formData.customMake && formData.year)
    ) {
      if (formData.make === "other") {
        // For custom makes, we don't have models to fetch
        setAvailableModels([])
      } else {
        const selectedMake = availableMakes.find((make) => make.name.toLowerCase() === formData.make)
        if (selectedMake) {
          fetchModels(selectedMake.id, formData.year)
        }
      }
    } else {
      setAvailableModels([])
    }
  }, [formData.make, formData.customMake, formData.year, availableMakes])

  // Function to handle publish
  const handlePublish = async () => {
    if (!user) {
      router.push("/sign-in")
      return
    }

    // Validate required fields
    if (
      !formData.make ||
      (formData.make === "other" && !formData.customMake) ||
      !formData.model ||
      (formData.model === "other" && !formData.customModel) ||
      !formData.year ||
      !formData.price
    ) {
      alert("Please fill in all required fields")
      return
    }

    setIsPublishing(true)

    try {
      const listingData = {
        title: `${formData.year} ${
          formData.make === "other"
            ? formData.customMake.charAt(0).toUpperCase() + formData.customMake.slice(1)
            : formData.make.charAt(0).toUpperCase() + formData.make.slice(1)
        } ${formData.model === "other" ? formData.customModel : formData.model}`,
        price: safeParseInt(formData.price),
        year: safeParseInt(formData.year),
        make: formData.make === "other" ? formData.customMake : formData.make,
        model: formData.model === "other" ? formData.customModel : formData.model,
        mileage: safeParseInt(formData.mileage),
        location: formData.city && formData.state ? `${formData.city}, ${formData.state}` : "Location not specified",
        condition: conditions.find((c) => c.value === formData.condition)?.label || "Good",
        description: safeString(formData.description),
        vehicle_category: formData.vehicleCategory,
        body_type: formData.bodyType,
        fuel_type: formData.fuelType,
        transmission: formData.transmission,
        exterior_color: formData.exteriorColor === "other" ? formData.customExteriorColor : formData.exteriorColor,
        interior_color: formData.interiorColor === "other" ? formData.customInteriorColor : formData.interiorColor,
        vin: safeString(formData.vin),
        negotiable: formData.negotiable,
        trade_considered: formData.tradeConsidered,
        financing_available: formData.financingAvailable,
        seller_id: user.id,
        updated_at: new Date().toISOString(),
      }

      let listing

      if (isEditMode && editListingId) {
        // Update existing listing
        const { data, error } = await supabase
          .from("listings")
          .update(listingData)
          .eq("id", editListingId)
          .eq("seller_id", user.id)
          .select()
          .single()

        if (error) throw error
        listing = data

        // Delete existing photos and features
        await supabase.from("listing_photos").delete().eq("listing_id", editListingId)
        await supabase.from("listing_features").delete().eq("listing_id", editListingId)
      } else {
        // Create new listing with active status
        listingData.published_at = new Date().toISOString()
        listingData.expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        listingData.status = "active" // Set status to active for new listings

        const { data, error } = await supabase.from("listings").insert([listingData]).select().single()

        if (error) throw error
        listing = data
      }

      // Handle photos
      if (uploadedPhotos.length > 0) {
        const photoPromises = uploadedPhotos.map(async (photoUrl, i) => {
          if (isEditMode) {
            // For edit mode, photos are already permanent
            return supabase.from("listing_photos").insert({
              listing_id: listing.id,
              photo_url: photoUrl,
              is_main_photo: i === 0,
              sort_order: i,
            })
          } else {
            // For new listings, move from temp to permanent
            try {
              // Extract temp file path
              const urlParts = photoUrl.split("/temp/")
              if (urlParts.length > 1) {
                const tempFileName = urlParts[1]
                const tempFilePath = `temp/${tempFileName}`

                // Generate permanent file path
                const fileExt = tempFileName.split(".").pop()
                const permanentFileName = `${listing.id}-${i}.${fileExt}`
                const permanentFilePath = `listings/${permanentFileName}`

                // Move file from temp to permanent location
                const { error: moveError } = await supabase.storage
                  .from("listing-photos")
                  .move(tempFilePath, permanentFilePath)

                if (moveError) {
                  console.error("Error moving photo:", moveError)
                  return null
                }

                // Get new public URL
                const {
                  data: { publicUrl },
                } = supabase.storage.from("listing-photos").getPublicUrl(permanentFilePath)

                // Insert photo record into database
                return supabase.from("listing_photos").insert({
                  listing_id: listing.id,
                  photo_url: publicUrl,
                  is_main_photo: i === 0,
                  sort_order: i,
                })
              }
            } catch (error) {
              console.error("Error processing photo:", error)
              return null
            }
          }
        })

        await Promise.all(photoPromises.filter(Boolean))
      }

      // Handle features
      if (formData.selectedFeatures.length > 0) {
        const featureInserts = formData.selectedFeatures.map((feature) => ({
          listing_id: listing.id,
          feature_name: feature,
        }))

        await supabase.from("listing_features").insert(featureInserts)
      }

      console.log(`Listing ${isEditMode ? "updated" : "published"} successfully:`, listing)

      // Navigate to appropriate page
      if (isEditMode) {
        router.push(`/listing/${listing.id}`)
      } else {
        router.push(`/sell/success?id=${listing.id}`)
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? "updating" : "publishing"} listing:`, error)
      alert(
        `There was an error ${isEditMode ? "updating" : "publishing"} your listing: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    } finally {
      setIsPublishing(false)
    }
  }

  // Show loading while checking auth
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Function to render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Vehicle Category</h2>
              <p className="text-gray-600">What type of vehicle are you selling?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicleCategories.map((category) => (
                <Card
                  key={category.value}
                  className={`cursor-pointer transition-all ${
                    formData.vehicleCategory === category.value ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleInputChange("vehicleCategory", category.value)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3">{category.icon}</div>
                    <h3 className="font-semibold text-lg">{category.label}</h3>
                    {formData.vehicleCategory === category.value && (
                      <Check className="h-6 w-6 text-blue-500 mx-auto mt-2" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Vehicle Details</h2>
              <p className="text-gray-600">
                Tell us about your{" "}
                {vehicleCategories.find((c) => c.value === formData.vehicleCategory)?.label.toLowerCase()}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="year">Year *</Label>
                <Select value={formData.year} onValueChange={(value) => handleInputChange("year", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 50 }, (_, i) => 2024 - i).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="make">Make *</Label>
                <Select
                  value={formData.make}
                  onValueChange={(value) => {
                    handleInputChange("make", value)
                    // Reset model when make changes
                    handleInputChange("model", "")
                    handleInputChange("customModel", "")
                  }}
                  disabled={isLoadingMakes}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingMakes ? "Loading makes..." : "Select make"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMakes.map((make) => (
                      <SelectItem key={make.id} value={make.name.toLowerCase()}>
                        {make.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="other">Other (not listed)</SelectItem>
                  </SelectContent>
                </Select>
                {formData.make === "other" && (
                  <Input
                    className="mt-2"
                    value={formData.customMake}
                    onChange={(e) => handleInputChange("customMake", e.target.value)}
                    placeholder="Enter make name"
                  />
                )}
              </div>

              <div>
                <Label htmlFor="model">Model *</Label>
                <Select
                  value={formData.model}
                  onValueChange={(value) => {
                    handleInputChange("model", value)
                    // Auto-set body type from selected model if available
                    if (value !== "other") {
                      const selectedModel = availableModels.find((model) => model.name.toLowerCase() === value)
                      if (selectedModel && selectedModel.body_type) {
                        handleInputChange("bodyType", selectedModel.body_type.toLowerCase())
                      }
                    }
                  }}
                  disabled={isLoadingModels || (!formData.make && formData.make !== "other") || !formData.year}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        (!formData.make && formData.make !== "other") || !formData.year
                          ? "Select make and year first"
                          : isLoadingModels
                            ? "Loading models..."
                            : "Select model"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map((model) => (
                      <SelectItem key={model.id} value={model.name.toLowerCase()}>
                        {model.name}
                        {model.body_type && <span className="text-gray-500 ml-2">({model.body_type})</span>}
                      </SelectItem>
                    ))}
                    <SelectItem value="other">Other (not listed)</SelectItem>
                  </SelectContent>
                </Select>
                {formData.model === "other" && (
                  <Input
                    className="mt-2"
                    value={formData.customModel}
                    onChange={(e) => handleInputChange("customModel", e.target.value)}
                    placeholder="Enter model name"
                  />
                )}
                {availableModels.length === 0 &&
                  formData.make &&
                  formData.make !== "other" &&
                  formData.year &&
                  !isLoadingModels && (
                    <p className="text-sm text-gray-500 mt-1">
                      No models found for {formData.make} {formData.year}. You can select "Other" to enter a custom
                      model.
                    </p>
                  )}
              </div>

              {/* Only show mileage for motorized RVs and all other vehicle types */}
              {!(
                formData.vehicleCategory === "rvs" &&
                (formData.bodyType === "travel trailer" ||
                  formData.bodyType === "fifth wheel" ||
                  formData.bodyType === "toy hauler" ||
                  formData.bodyType === "pop-up camper" ||
                  formData.bodyType === "truck camper")
              ) && (
                <div>
                  <Label htmlFor="mileage">{formData.vehicleCategory === "boats" ? "Engine Hours" : "Mileage"} *</Label>
                  <Input
                    id="mileage"
                    type="number"
                    value={formData.mileage}
                    onChange={(e) => handleInputChange("mileage", e.target.value)}
                    placeholder={formData.vehicleCategory === "boats" ? "e.g., 250" : "e.g., 45000"}
                  />
                </div>
              )}

              {/* Only show fuel type for motorized RVs and all other vehicle types */}
              {!(
                formData.vehicleCategory === "rvs" &&
                (formData.bodyType === "travel trailer" ||
                  formData.bodyType === "fifth wheel" ||
                  formData.bodyType === "toy hauler" ||
                  formData.bodyType === "pop-up camper" ||
                  formData.bodyType === "truck camper")
              ) && (
                <div>
                  <Label htmlFor="fuelType">
                    {formData.vehicleCategory === "boats" ? "Engine Type" : "Fuel Type"} *
                  </Label>
                  <Select value={formData.fuelType} onValueChange={(value) => handleInputChange("fuelType", value)}>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={formData.vehicleCategory === "boats" ? "Select engine type" : "Select fuel type"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {getCurrentVehicleData().fuelTypes.map((type) => (
                        <SelectItem key={type} value={type.toLowerCase()}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(formData.vehicleCategory === "cars-trucks" ||
                (formData.vehicleCategory === "rvs" &&
                  !(
                    formData.bodyType === "travel trailer" ||
                    formData.bodyType === "fifth wheel" ||
                    formData.bodyType === "toy hauler" ||
                    formData.bodyType === "pop-up camper" ||
                    formData.bodyType === "truck camper"
                  ))) && (
                <div>
                  <Label htmlFor="transmission">Transmission *</Label>
                  <Select
                    value={formData.transmission}
                    onValueChange={(value) => handleInputChange("transmission", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select transmission" />
                    </SelectTrigger>
                    <SelectContent>
                      {transmissionTypes.map((type) => (
                        <SelectItem key={type} value={type.toLowerCase()}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="vin">VIN/HIN/Serial Number (Optional)</Label>
                <Input
                  id="vin"
                  value={formData.vin}
                  onChange={(e) => handleInputChange("vin", e.target.value)}
                  placeholder="Vehicle identification number"
                />
              </div>

              {!(
                formData.vehicleCategory === "rvs" &&
                (formData.bodyType === "travel trailer" ||
                  formData.bodyType === "fifth wheel" ||
                  formData.bodyType === "toy hauler" ||
                  formData.bodyType === "pop-up camper" ||
                  formData.bodyType === "truck camper")
              ) && (
                <div>
                  <Label htmlFor="exteriorColor">Exterior Color</Label>
                  <Select
                    value={formData.exteriorColor}
                    onValueChange={(value) => handleInputChange("exteriorColor", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select exterior color" />
                    </SelectTrigger>
                    <SelectContent>
                      {exteriorColors.map((color) => (
                        <SelectItem key={color} value={color.toLowerCase()}>
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.exteriorColor === "other" && (
                    <Input
                      className="mt-2"
                      value={formData.customExteriorColor}
                      onChange={(e) => handleInputChange("customExteriorColor", e.target.value)}
                      placeholder="Enter custom exterior color"
                    />
                  )}
                </div>
              )}

              {(formData.vehicleCategory === "cars-trucks" ||
                (formData.vehicleCategory === "rvs" &&
                  !(
                    formData.bodyType === "travel trailer" ||
                    formData.bodyType === "fifth wheel" ||
                    formData.bodyType === "toy hauler" ||
                    formData.bodyType === "pop-up camper" ||
                    formData.bodyType === "truck camper"
                  ))) && (
                <div>
                  <Label htmlFor="interiorColor">Interior Color</Label>
                  <Select
                    value={formData.interiorColor}
                    onValueChange={(value) => handleInputChange("interiorColor", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select interior color" />
                    </SelectTrigger>
                    <SelectContent>
                      {interiorColors.map((color) => (
                        <SelectItem key={color} value={color.toLowerCase()}>
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.interiorColor === "other" && (
                    <Input
                      className="mt-2"
                      value={formData.customInteriorColor}
                      onChange={(e) => handleInputChange("customInteriorColor", e.target.value)}
                      placeholder="Enter custom interior color"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Pricing & Condition</h2>
              <p className="text-gray-600">Set your price and describe the condition</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="price">Asking Price *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    placeholder="25000"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <Label>Vehicle Condition *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                  {conditions.map((condition) => (
                    <Card
                      key={condition.value}
                      className={`cursor-pointer transition-all ${
                        formData.condition === condition.value ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
                      }`}
                      onClick={() => handleInputChange("condition", condition.value)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{condition.label}</h4>
                          {formData.condition === condition.value && <Check className="h-5 w-5 text-blue-500" />}
                        </div>
                        <p className="text-sm text-gray-600">{condition.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="negotiable"
                      checked={formData.negotiable}
                      onCheckedChange={(checked) => handleInputChange("negotiable", checked)}
                    />
                    <Label htmlFor="negotiable">Price is negotiable</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="tradeConsidered"
                      checked={formData.tradeConsidered}
                      onCheckedChange={(checked) => handleInputChange("tradeConsidered", checked)}
                    />
                    <Label htmlFor="tradeConsidered">Trade-in considered</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="financingAvailable"
                      checked={formData.financingAvailable}
                      onCheckedChange={(checked) => handleInputChange("financingAvailable", checked)}
                    />
                    <Label htmlFor="financingAvailable">Financing available</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Photos</h2>
              <p className="text-gray-600">Add photos to showcase your vehicle (up to {MAX_PHOTOS} photos)</p>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(",")}
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Upload Error */}
            {uploadError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{uploadError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {uploadedPhotos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <Image
                      src={photo || "/placeholder.svg"}
                      alt={`Vehicle photo ${index + 1}`}
                      width={200}
                      height={150}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removePhoto(index)}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    {index === 0 && <Badge className="absolute bottom-2 left-2 bg-blue-600">Main Photo</Badge>}
                  </div>
                ))}

                {uploadedPhotos.length < MAX_PHOTOS && (
                  <button
                    onClick={handlePhotoUpload}
                    disabled={isUploading}
                    className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
                        <span className="text-sm text-gray-600">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Camera className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">Add Photo</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {uploadedPhotos.length === 0 && !isUploading && (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Upload your first photo</h3>
                  <p className="text-gray-600 mb-4">Great photos help your vehicle sell faster</p>
                  <Button onClick={handlePhotoUpload} disabled={isUploading}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Photos
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Photo Tips</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Take photos in good lighting (preferably outdoors)</li>
                <li>• Include exterior shots from all angles</li>
                <li>• Show the interior, dashboard, and any damage</li>
                <li>• Clean your vehicle before taking photos</li>
                <li>• Accepted formats: JPEG, PNG, WebP (max 10MB each)</li>
              </ul>
            </div>

            {/* Photo count indicator */}
            <div className="text-center text-sm text-gray-600">
              {uploadedPhotos.length} of {MAX_PHOTOS} photos uploaded
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Description & Features</h2>
              <p className="text-gray-600">Describe your vehicle and highlight its features</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label>Listing Title</Label>
                <div className="p-3 bg-gray-50 border rounded-md">
                  <p className="text-lg font-medium text-gray-900">
                    {formData.year && (formData.make || formData.customMake) && (formData.model || formData.customModel)
                      ? `${formData.year} ${
                          formData.make === "other"
                            ? formData.customMake.charAt(0).toUpperCase() + formData.customMake.slice(1)
                            : formData.make.charAt(0).toUpperCase() + formData.make.slice(1)
                        } ${formData.model === "other" ? formData.customModel : formData.model}`
                      : "Title will be generated from vehicle details"}
                  </p>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  This title is automatically generated from your vehicle details
                </p>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe your vehicle's condition, maintenance history, any modifications, and why you're selling..."
                  rows={6}
                  maxLength={2000}
                />
                <p className="text-sm text-gray-500 mt-1">{formData.description.length}/2000 characters</p>
              </div>

              <div>
                <Label>Features & Options</Label>
                <p className="text-sm text-gray-600 mb-3">Select all features that apply to your vehicle</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {getCurrentFeatures().map((feature) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <Checkbox
                        id={feature}
                        checked={formData.selectedFeatures.includes(feature)}
                        onCheckedChange={() => handleFeatureToggle(feature)}
                      />
                      <Label htmlFor={feature} className="text-sm">
                        {feature}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Vehicle Location *</Label>
                <p className="text-sm text-gray-600 mb-3">Where is this vehicle located?</p>

                {/* Show current location if available */}
                {profile?.city && profile?.state && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-700 font-medium">Current Location</p>
                        <p className="text-blue-900">
                          {profile.city}, {profile.state}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          handleInputChange("city", profile.city)
                          handleInputChange("state", profile.state)
                        }}
                        className="border-blue-300 text-blue-700 hover:bg-blue-100"
                      >
                        Use This Location
                      </Button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Select value={formData.state} onValueChange={(value) => handleInputChange("state", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "Alabama",
                          "Alaska",
                          "Arizona",
                          "Arkansas",
                          "California",
                          "Colorado",
                          "Connecticut",
                          "Delaware",
                          "Florida",
                          "Georgia",
                          "Hawaii",
                          "Idaho",
                          "Illinois",
                          "Indiana",
                          "Iowa",
                          "Kansas",
                          "Kentucky",
                          "Louisiana",
                          "Maine",
                          "Maryland",
                          "Massachusetts",
                          "Michigan",
                          "Minnesota",
                          "Mississippi",
                          "Missouri",
                          "Montana",
                          "Nebraska",
                          "Nevada",
                          "New Hampshire",
                          "New Jersey",
                          "New Mexico",
                          "New York",
                          "North Carolina",
                          "North Dakota",
                          "Ohio",
                          "Oklahoma",
                          "Oregon",
                          "Pennsylvania",
                          "Rhode Island",
                          "South Carolina",
                          "South Dakota",
                          "Tennessee",
                          "Texas",
                          "Utah",
                          "Vermont",
                          "Virginia",
                          "Washington",
                          "West Virginia",
                          "Wisconsin",
                          "Wyoming",
                        ].map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Select value={formData.city} onValueChange={(value) => handleInputChange("city", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.state &&
                          getCitiesForState(formData.state).map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        {!formData.state && (
                          <SelectItem value="no-state-selected" disabled>
                            Please select a state first
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Option to use current location if not already set */}
                {(!formData.city || !formData.state) && profile?.city && profile?.state && (
                  <div className="mt-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleInputChange("city", profile.city)
                        handleInputChange("state", profile.state)
                      }}
                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Use My Profile Location ({profile.city}, {profile.state})
                    </Button>
                  </div>
                )}
              </div>

              {/* Contact Info Preview */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Your listing will use the following contact information from your profile:
                </p>
                <div className="text-sm">
                  <p>
                    <strong>Name:</strong> {profile?.first_name} {profile?.last_name}
                  </p>
                  <p>
                    <strong>Email:</strong> {profile?.email}
                  </p>
                  {profile?.phone && (
                    <p>
                      <strong>Phone:</strong> {profile.phone}
                    </p>
                  )}
                  {profile?.city && profile?.state && (
                    <p>
                      <strong>Location:</strong> {profile.city}, {profile.state}
                    </p>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">You can update this information in your profile settings.</p>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Render the component
  return (
    <div className="bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditMode ? "Edit Your Listing" : "List Your Vehicle"}
            </h1>
            <span className="text-sm text-gray-600">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-between mb-8">
          {[
            { step: 1, icon: Car, label: "Category" },
            { step: 2, icon: Car, label: "Details" },
            { step: 3, icon: DollarSign, label: "Pricing" },
            { step: 4, icon: Camera, label: "Photos" },
            { step: 5, icon: FileText, label: "Description" },
          ].map(({ step, icon: Icon, label }) => (
            <div key={step} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step <= currentStep ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className={`text-xs mt-1 ${step <= currentStep ? "text-blue-600" : "text-gray-400"}`}>{label}</span>
            </div>
          ))}
        </div>

        {/* Step Indicators */}

        {/* Step content */}
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
            Previous
          </Button>
          {currentStep === totalSteps ? (
            <Button onClick={handlePublish} disabled={isPublishing}>
              {isPublishing ? (
                <>
                  Publishing...
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                </>
              ) : (
                "Publish Listing"
              )}
            </Button>
          ) : (
            <Button onClick={nextStep}>Next</Button>
          )}
        </div>
      </div>
    </div>
  )
}
