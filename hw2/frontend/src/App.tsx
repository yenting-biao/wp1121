import { useEffect, useState } from "react";

//import { Add as AddIcon } from "@mui/icons-material";
//import { Button } from "@mui/material";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Unstable_Grid2";

import CardList from "@/components/CardList";
import type { CardListPageProps } from "@/components/CardListPage";
import CardListPage from "@/components/CardListPage";
import HeaderBar from "@/components/HeaderBar";
//import SongListGrid from "@/components/SongListGrid";
//import SongList from "@/components/SongList";
import NewListDialog from "@/components/NewListDialog";
import SubHeaderBar from "@/components/SubHeaderBar";
import useCards from "@/hooks/useCards";

function App() {
  const { lists, fetchLists, fetchCards } = useCards();
  const [showHomePage, setShowHomePage] = useState(true);
  const [newListDialogOpen, setNewListDialogOpen] = useState(false);
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const [selectedCardListId, setSelectedCardListId] = useState("");

  useEffect(() => {
    fetchLists();
    fetchCards();
  }, [fetchCards, fetchLists]);

  return (
    <>
      <HeaderBar onclickHome={() => setShowHomePage(true)} />
      {showHomePage && (
        <>
          <SubHeaderBar
            onclickAdd={() => setNewListDialogOpen(true)}
            onclickDelete={() => setShowDeleteButton(!showDeleteButton)}
            deleteText={showDeleteButton}
          />
          <main className="mx-auto flex max-h-full flex-row gap-6 px-24 py-12">
            {/*<Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 2, sm: 8, md: 12, lg: 16, xl: 24}}>
              {Array.from(Array(13)).map((_, index) => (
                <Grid xs={2} sm={4} md={4} key={index}>
                  <SongList />
                </Grid>
              ))}
            </Grid>
            </Box>*/}

            <Box sx={{ flexGrow: 1 }}>
              <Grid
                container
                spacing={{ xs: 2, md: 3 }}
                columns={{ xs: 2, sm: 8, md: 12, lg: 16, xl: 24 }}
              >
                {lists.map((list) => (
                  <Grid xs={2} sm={4} md={4} key={list.id}>
                    <CardList
                      key={list.id}
                      {...list}
                      showDelete={showDeleteButton}
                      onclickCard={() => {
                        setShowHomePage(false);
                        setSelectedCardListId(list.id);
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
            {/*<div>
            <Button
              variant="contained"
              className="w-80"
              onClick={() => setNewListDialogOpen(true)}
            >
              <AddIcon className="mr-2" />
              Add a list
            </Button>
          </div>*/}
            {/*<SongListGrid />*/}
            <NewListDialog
              open={newListDialogOpen}
              onClose={() => setNewListDialogOpen(false)}
            />
          </main>
        </>
      )}
      {!showHomePage && (
        <>
          <main className="mx-auto flex max-h-full flex-row gap-6 px-24 py-12">
            <Box sx={{ flexGrow: 1 }}>
              {/*lists.map((list) => (
                  <Grid xs={2} sm={4} md={4} key={selectedCardListId}>
                    <CardListPage key={selectedCardListId} {...list} />
                  </Grid>
                ))*/}
              <CardListPage
                key={selectedCardListId}
                {...(lists.find(
                  (list) => list.id === selectedCardListId,
                ) as CardListPageProps)}
              />
            </Box>
          </main>
        </>
      )}
    </>
  );
}

export default App;
